import type { IPayment, PaymentBody } from '../interfaces/Payment.js';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import { type Request, type Response } from 'express';
import { handleControllerError } from '../helpers/error-handler.js';

export default class PaymentController {
  /**
   * Registers a new payment.
   * Checks for duplicates even in soft-deleted records to ensure financial integrity.
   */
  static async register(req: Request<{}, {}, PaymentBody>, res: Response) {
    const { memberId, month, year } = req.body;

    try {
      // Validate if the member exists (checks active and inactive, but not deleted)
      const member = await Member.findByPk(memberId);
      if (!member || !member.isActive) {
        return res.status(422).json({
          message: 'Aluno não encontrado ou está inativo no sistema.',
        });
      }

      // Prevent duplicate payments for the same membership period
      const verifyDoublePayment = await Payment.findOne({
        where: {
          memberId,
          month,
          year,
          status: 'paid',
          category: 'membership',
        },
        paranoid: false, // Prevents creating a record that already exists as soft-deleted
      });

      if (verifyDoublePayment) {
        const status = verifyDoublePayment.deletedAt
          ? 'excluído'
          : 'registrado';
        return res.status(422).json({
          message: `Já existe um pagamento ${status} para ${month}/${year}. Verifique a lixeira ou restaure o registro.`,
        });
      }

      const generatedDueDate = new Date(year, month - 1, member.dueDay);
      generatedDueDate.setHours(0, 0, 0, 0);

      const newPayment = await Payment.create({
        ...req.body,
        dueDate: generatedDueDate,
      });

      return res.status(201).json({
        message: 'Pagamento registrado com sucesso!',
        payment: newPayment,
      });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao registrar pagamento');
    }
  }

  /**
   * Retrieves all payments (excluding soft-deleted ones).
   */
  static async getAll(req: Request, res: Response) {
    try {
      const payments = (await Payment.findAll({
        order: [
          ['year', 'DESC'],
          ['month', 'DESC'],
        ],
        include: [
          { model: Member, attributes: ['name', 'dueDay'], as: 'member' },
        ],
      })) as IPayment[];

      return res.status(200).json({ payments });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao recuperar pagamentos');
    }
  }

  /**
   * Cancels an existing payment.
   * Changes the status to "cancelled"
   */
  static async cancel(
    req: Request<{ id: string }, {}, PaymentBody>,
    res: Response,
  ) {
    const { id } = req.params;

    try {
      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({ message: 'Pagamento não encontrado!' });
      }

      if (payment.status === 'cancelled') {
        return res
          .status(422)
          .json({ message: 'Pagamento cancelado anteriormente!' });
      }

      const updatedDescription =
        `${payment.description || ''} / Estornado`.trim();

      await payment.update({
        status: 'cancelled',
        description: updatedDescription,
      });

      return res
        .status(200)
        .json({ message: 'Pagamento cancelado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar cancelar');
    }
  }

  /**
   * Updates an existing payment record.
   */
  static async update(
    req: Request<{ id: string }, {}, PaymentBody>,
    res: Response,
  ) {
    const { id } = req.params;
    const { month, year, memberId, ...otherData } = req.body;

    try {
      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({ message: 'Pagamento não encontrado!' });
      }

      let updatedData: any = { ...otherData, month, year };

      if (month || year) {
        const member = await Member.findByPk(memberId || payment.memberId);
        if (member) {
          const newMonth = month || payment.month;
          const newYear = year || payment.year;
          updatedData.dueDate = new Date(newYear, newMonth - 1, member.dueDay);
        }
      }

      await payment.update(updatedData);

      return res
        .status(200)
        .json({ message: 'Pagamento atualizado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar pagamento');
    }
  }

  /**
   * Logical deletion (Soft Delete).
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const payment = await Payment.findByPk(id);

      if (!payment) {
        return res.status(404).json({ message: 'Pagamento não encontrado!' });
      }

      await payment.destroy();

      return res
        .status(200)
        .json({ message: 'Pagamento enviado para a lixeira!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir pagamento');
    }
  }

  /**
   * Restores a soft-deleted payment.
   */
  static async restore(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const payment = await Payment.findByPk(id, { paranoid: false });

      if (!payment || !payment.deletedAt) {
        return res
          .status(404)
          .json({ message: 'Pagamento não encontrado na lixeira!' });
      }

      await payment.restore();

      return res
        .status(200)
        .json({ message: 'Pagamento restaurado com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao restaurar pagamento');
    }
  }

  /**
   * Retrieves payments filtered by member, month, or year.
   */
  static async getByFilters(
    req: Request<{}, {}, {}, { memberId: string; month: string; year: string }>,
    res: Response,
  ) {
    const { memberId, month, year } = req.query;

    const whereConditions = {
      ...(memberId && { memberId: String(memberId) }),
      ...(month && { month: Number(month) }),
      ...(year && { year: Number(year) }),
      category: 'membership',
    };

    try {
      const payments = (await Payment.findAll({
        where: whereConditions,
        order: [['paymentDate', 'DESC']],
        include: [
          {
            model: Member,
            attributes: ['id', 'name', 'dueDay'],
            as: 'member',
            include: [{ model: Plan, as: 'plan', attributes: ['id', 'price'] }],
          },
        ],
      })) as IPayment[];

      return res.status(200).json({ payments });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao filtrar pagamentos');
    }
  }
}
