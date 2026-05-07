import type { IPlan, PlanBody } from '../interfaces/Plan.js';
import Plan from '../models/Plan.js';
import type { Request, Response } from 'express';
import { handleControllerError } from '../helpers/error-handler.js';

export default class PlanController {
  /**
   * Registers a new membership plan.
   */
  static async register(req: Request<{}, {}, PlanBody>, res: Response) {
    const { name, price, timesPerWeek } = req.body;

    try {
      const planData = { name, price, timesPerWeek, isActive: true };
      const newPlan = await Plan.create(planData);

      return res.status(201).json({
        message: 'Plano criado com sucesso!',
        plan: newPlan,
      });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao criar o plano');
    }
  }

  /**
   * Retrieves all active plans (excluding soft-deleted ones).
   */
  static async getAll(req: Request, res: Response) {
    try {
      const plans = (await Plan.findAll({
        order: [['price', 'ASC']],
      })) as IPlan[];

      return res.status(200).json({ plans });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao recuperar planos');
    }
  }

  /**
   * Retrieves a specific plan by ID.
   */
  static async getById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado!' });
      }

      return res.status(200).json({ plan });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao buscar o plano');
    }
  }

  /**
   * Updates plan details.
   */
  static async update(
    req: Request<{ id: string }, {}, PlanBody>,
    res: Response,
  ) {
    const { id } = req.params;

    try {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado!' });
      }

      if (!plan.isActive) {
        return res.status(422).json({
          message:
            'Não é possível atualizar um plano inativo. Reative-o primeiro.',
        });
      }

      await plan.update(req.body);

      return res.status(200).json({ message: 'Plano atualizado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar o plano');
    }
  }

  /**
   * Logical deletion (Soft Delete).
   * Moves the plan to the trash instead of permanent removal.
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const plan = await Plan.findByPk(id);

      if (!plan) {
        return res.status(404).json({ message: 'Plano não encontrado!' });
      }

      // Soft delete: sets the deletedAt timestamp
      await plan.destroy();

      return res.status(200).json({ message: 'Plano enviado para a lixeira!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir o plano');
    }
  }

  /**
   * Restores a soft-deleted plan.
   */
  static async restore(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const plan = await Plan.findByPk(id, { paranoid: false });

      if (!plan || !plan.deletedAt) {
        return res
          .status(404)
          .json({ message: 'Plano não encontrado na lixeira!' });
      }

      await plan.restore();

      return res.status(200).json({ message: 'Plano restaurado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao restaurar o plano');
    }
  }

  /**
   * Inactivates a plan without deleting it.
   */
  static async inactivate(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    try {
      const plan = await Plan.findByPk(id);
      if (!plan)
        return res.status(404).json({ message: 'Plano não encontrado!' });
      await plan.update({ isActive: false });
      return res.status(200).json({ message: 'Plano inativado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao inativar plano');
    }
  }

  /**
   * Reactivates an inactive plan.
   */
  static async reactivate(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    try {
      const plan = await Plan.findByPk(id);
      if (!plan)
        return res.status(404).json({ message: 'Plano não encontrado!' });
      await plan.update({ isActive: true });
      return res.status(200).json({ message: 'Plano reativado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao reativar plano');
    }
  }
}
