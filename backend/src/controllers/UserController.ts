import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Op, ValidationError, DatabaseError } from 'sequelize';

import type { Request, Response } from 'express';
import type { UserBody, LoginBody, IUser } from '../interfaces/User.js';
import type { TokenPayload } from '../interfaces/Auth.js';

// Helpers
import createUserToken from '../helpers/create-user-token.js';
import getToken from '../helpers/get-token.js';
import RefreshToken from '../models/RefreshToken.js';
import { handleControllerError } from '../helpers/error-handler.js';

export default class UserController {
  /**
   * Registers a new user.
   * The first user registered in the system automatically have Admin status.
   */
  static async register(req: Request<{}, {}, UserBody>, res: Response) {
    const { name, email, password, isAdmin: requestedAdmin } = req.body;

    try {
      // Check for duplicates including soft-deleted ones
      const userExists = await User.findOne({
        where: { [Op.or]: [{ name }, { email }] },
        paranoid: false,
      });

      if (userExists) {
        if (userExists.deletedAt) {
          return res.status(409).json({
            message:
              'Este usuário consta como excluído. Deseja restaurar o acesso?',
            userId: userExists.id,
          });
        }
        const field = userExists.email === email ? 'E-mail' : 'Nome';
        return res
          .status(422)
          .json({ message: `Este ${field} ya está em uso!` });
      }

      const userCount = await User.count({ paranoid: false });
      let isAdmin = userCount === 0;

      // If not the first user, check if the requester is an admin
      if (userCount > 0) {
        const token = getToken(req);
        if (!token) {
          return res.status(401).json({
            message: 'Apenas administradores podem criar novos usuários.',
          });
        }

        try {
          const secret = process.env.JWT_SECRET as string;
          const decoded = jwt.verify(token, secret) as TokenPayload;

          if (!decoded.isAdmin) {
            return res.status(403).json({
              message: 'Acesso negado! Recurso exclusivo para administradores.',
            });
          }

          isAdmin = requestedAdmin ?? false;
        } catch (err) {
          return res.status(401).json({ message: 'Token inválido.' });
        }
      }

      // Hash the password before saving
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        name,
        email,
        password: passwordHash,
        isAdmin,
        isActive: true,
      });

      if (userCount === 0) {
        await createUserToken(newUser, req, res);
      } else {
        return res.status(201).json({
          message: 'Usuário criado com sucesso pelo administrador!',
          user: {
            id: newUser.id,
            name: newUser.name,
            isAdmin: newUser.isAdmin,
          },
        });
      }
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao criar usuário');
    }
  }

  /**
   * Authenticates a user and returns authorization tokens.
   */
  static async login(req: Request<{}, {}, LoginBody>, res: Response) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res
          .status(401)
          .json({ message: 'E-mail ou senha inválidos. Tente novamente.' });
      }

      const checkPassword = await bcrypt.compare(password, user.password!);

      if (!checkPassword) {
        return res
          .status(401)
          .json({ message: 'E-mail ou senha inválidos. Tente novamente.' });
      }

      await createUserToken(user, req, res);
    } catch (error: unknown) {
      return handleControllerError(
        res,
        error,
        'Erro interno no servidor. Tente novamente mais tarde.',
      );
    }
  }

  /**
   * Retrieves all users registered in the system.
   */
  static async getAll(req: Request, res: Response) {
    try {
      const users = (await User.findAll({
        attributes: ['id', 'name', 'email', 'isAdmin', 'isActive'],
        order: [['id', 'ASC']],
        raw: true,
      })) as IUser[];

      return res.status(200).json({ users });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao recuperar usuários');
    }
  }

  /**
   * Validates the current token and returns the logged-in user's data.
   */
  static async checkUser(req: Request, res: Response) {
    let currentUser: IUser | null = null;

    if (req.headers.authorization) {
      const token = getToken(req);

      if (!token) {
        return res.status(200).send(null);
      }

      try {
        const secret = process.env.JWT_SECRET!;
        const decoded = jwt.verify(token, secret) as any as TokenPayload;

        currentUser = (await User.findByPk(decoded.id, {
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
          raw: true,
        })) as IUser | null;
      } catch (error) {
        currentUser = null;
      }
    }

    return res.status(200).send(currentUser);
  }

  /**
   * Retrieves user profile by ID.
   */
  static async getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const user = (await User.findByPk(id, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        raw: true,
      })) as IUser | null;

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado!' });
      }

      return res.status(200).json({ user });
    } catch (error: unknown) {
      return handleControllerError(
        res,
        error,
        'Erro ao buscar dados do usuário',
      );
    }
  }

  /**
   * Updates user details. Admins can update any user; users can only update themselves.
   */
  static async update(
    req: Request<{ id: string }, {}, UserBody>,
    res: Response,
  ) {
    const { id } = req.params;
    const { name, email, password, isAdmin } = req.body;

    try {
      const loggedUser = req.user as IUser;
      const isEditingSelf = Number(id) === loggedUser.id;

      if (!loggedUser.isAdmin && !isEditingSelf) {
        return res.status(403).json({ message: 'Acesso negado!' });
      }

      const user = await User.findByPk(id);
      if (!user)
        return res.status(404).json({ message: 'Usuário não encontrado!' });

      if (name || email) {
        const conflict = await User.findOne({
          where: {
            [Op.or]: [
              ...(name ? [{ name }] : []),
              ...(email ? [{ email }] : []),
            ],
            id: { [Op.ne]: Number(id) },
          },
          paranoid: false,
        });
        if (conflict)
          return res.status(422).json({
            message:
              'Nome ou E-mail já estão em uso por outro registro ativo ou excluído!',
          });
      }

      const updatedData: any = {};
      if (name) updatedData.name = name;
      if (email) updatedData.email = email;

      if (loggedUser.isAdmin && isAdmin !== undefined) {
        updatedData.isAdmin = isAdmin;
      }

      if (password) {
        const salt = await bcrypt.genSalt(12);
        updatedData.password = await bcrypt.hash(password, salt);
      }

      await User.update(updatedData, { where: { id } });
      return res
        .status(200)
        .json({ message: 'Usuário atualizado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar usuário');
    }
  }

  /**
   * Generates a new access token using a valid refresh token.
   */
  static async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Token não encontrado!' });
    }

    try {
      const dbToken = await RefreshToken.findOne({
        where: { token: refreshToken },
      });

      // Unified check for non-existent or expired tokens for security
      if (!dbToken || new Date() > dbToken.expiresAt) {
        if (dbToken) {
          await RefreshToken.destroy({ where: { id: dbToken.id } });
        }

        return res.status(403).json({
          message:
            'Sessão inválida ou expirada. Por favor, faça login novamente.',
        });
      }

      const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
      const decoded = jwt.verify(refreshToken, refreshSecret) as { id: number };

      const user = await User.findByPk(decoded.id);
      if (!user)
        return res.status(404).json({ message: 'Usuário não encontrado' });

      const newToken = jwt.sign(
        { name: user.name, id: user.id, isAdmin: user.isAdmin },
        process.env.JWT_SECRET as string,
        { expiresIn: '15m' },
      );

      return res.status(200).json({ token: newToken });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Token inválido');
    }
  }

  /**
   * Deletes a user account using soft delete. Prevents users from deleting themselves.
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const loggedUser = req.user as IUser;

    try {
      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado!' });
      }

      if (user.id === loggedUser.id) {
        return res.status(422).json({
          message:
            'Você não pode excluir a conta na qual está logado atualmente!',
        });
      }

      if (!loggedUser.isAdmin) {
        return res.status(403).json({
          message:
            'Acesso negado! Apenas administradores podem excluir usuários.',
        });
      }

      await user.destroy();

      return res
        .status(200)
        .json({ message: 'Usuário enviado para a lixeira!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir usuário');
    }
  }

  /**
   * Restores a soft-deleted user profile.
   */
  static async restore(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const user = await User.findByPk(id, { paranoid: false });

      if (!user || !user.deletedAt) {
        return res
          .status(404)
          .json({ message: 'Usuário não encontrado na lixeira!' });
      }

      await user.restore();

      return res
        .status(200)
        .json({ message: 'Acesso do usuário restaurado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao restaurar usuário');
    }
  }
}
