import type { IMember, MemberBody } from '../interfaces/Member.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import type { Request, Response } from 'express';
import { Op } from 'sequelize';
import { handleControllerError } from '../helpers/error-handler.js';

export default class MemberController {
  /**
   * Registers a new member.
   * Checks for duplicates even among soft-deleted records to prevent unique constraint errors.
   */
  static async register(req: Request<{}, {}, MemberBody>, res: Response) {
    const { cpf, email, planId } = req.body;

    try {
      const plan = await Plan.findByPk(planId);
      if (!plan || !plan.isActive) {
        return res.status(422).json({
          message: 'O plano selecionado é inválido ou está inativo.',
        });
      }

      // Look for existing members including soft-deleted ones (paranoid: false)
      const existingMember = await Member.findOne({
        where: { [Op.or]: [{ cpf }, { email }] },
        paranoid: false,
      });

      if (existingMember) {
        // If the member exists but was soft-deleted, suggest restoration
        if (existingMember.deletedAt) {
          return res.status(409).json({
            message:
              'Este aluno já consta no sistema como excluído. Deseja restaurar o cadastro?',
            memberId: existingMember.id,
          });
        }

        const field = existingMember.cpf === cpf ? 'CPF' : 'E-mail';
        return res
          .status(422)
          .json({ message: `Este ${field} já está em uso!` });
      }

      const memberData: IMember = {
        ...req.body,
        restrictions: req.body.restrictions || '',
        dueDay: 10,
        isActive: true,
      };

      const newMember = await Member.create(memberData);

      return res.status(201).json({
        message: 'Aluno cadastrado com sucesso!',
        member: newMember,
      });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao cadastrar aluno');
    }
  }

  /**
   * Retrieves all members (excluding soft-deleted ones by default).
   */
  static async getAll(req: Request, res: Response) {
    try {
      const members = (await Member.findAll({
        order: [
          ['isActive', 'DESC'],
          ['name', 'ASC'],
        ],
        include: [
          { model: Plan, attributes: ['id', 'name', 'price'], as: 'plan' },
        ],
      })) as IMember[];

      return res.status(200).json({ members });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao recuperar alunos');
    }
  }

  /**
   * Retrieves a single member by ID.
   */
  static async getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const member = await Member.findByPk(id);

      if (!member) {
        return res.status(404).json({ message: 'Aluno não encontrado!' });
      }

      return res.status(200).json({ member });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao buscar dados do aluno');
    }
  }

  /**
   * Updates member data.
   */
  static async update(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { cpf, email, planId } = req.body;

    try {
      const member = await Member.findByPk(id);

      if (!member) {
        return res.status(404).json({ message: 'Aluno não encontrado!' });
      }

      if (!member.isActive) {
        return res.status(422).json({
          message:
            'Não é possível atualizar um aluno inativo. Reative-o primeiro.',
        });
      }

      const existingMember = await Member.findOne({
        where: {
          [Op.or]: [...(cpf ? [{ cpf }] : []), ...(email ? [{ email }] : [])],
          id: { [Op.ne]: Number(id) },
        },
        paranoid: false, // Check in trash to avoid database conflicts
      });

      if (existingMember) {
        const field = existingMember.email === email ? 'E-mail' : 'CPF';
        return res.status(422).json({
          message: `Este ${field} já está em uso por outro registro (ativo ou excluído).`,
        });
      }

      if (planId) {
        const plan = await Plan.findByPk(planId);
        if (!plan || !plan.isActive) {
          return res
            .status(422)
            .json({ message: 'Plano inválido ou inativo.' });
        }
      }

      await member.update(req.body);

      return res
        .status(200)
        .json({ message: 'Cadastro atualizado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar aluno');
    }
  }

  /**
   * Logical deletion (Soft Delete).
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const member = await Member.findByPk(id);

      if (!member) {
        return res.status(404).json({ message: 'Aluno não encontrado!' });
      }

      await member.destroy();

      return res.status(200).json({ message: 'Aluno enviado para a lixeira!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir aluno');
    }
  }

  /**
   * Restores a soft-deleted member.
   */
  static async restore(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const member = await Member.findByPk(id, { paranoid: false });

      if (!member || !member.deletedAt) {
        return res
          .status(404)
          .json({ message: 'Aluno não encontrado na lixeira!' });
      }

      await member.restore();

      return res
        .status(200)
        .json({ message: 'Cadastro do aluno restaurado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao restaurar aluno');
    }
  }

  /**
   * Inactivates a member.
   */
  static async inactivate(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    try {
      const member = await Member.findByPk(id);
      if (!member)
        return res.status(404).json({ message: 'Aluno não encontrado!' });
      if (!member.isActive)
        return res.status(422).json({ message: 'Este aluno já está inativo.' });

      await member.update({ isActive: false });
      return res.status(200).json({ message: 'Aluno inativado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao inativar aluno');
    }
  }

  /**
   * Reactivates a member.
   */
  static async reactivate(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    try {
      const member = await Member.findByPk(id);
      if (!member)
        return res.status(404).json({ message: 'Aluno não encontrado!' });
      if (member.isActive)
        return res.status(422).json({ message: 'Este aluno já está ativo.' });

      await member.update({ isActive: true });
      return res.status(200).json({ message: 'Aluno reativado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao reativar aluno');
    }
  }
}
