import { type Request, type Response } from 'express';
import Expense from '../models/Expense.js';
import type { IExpense, ExpenseBody } from '../interfaces/Expense.js';
import { handleControllerError } from '../helpers/error-handler.js';
import { Op, where } from 'sequelize';

export default class ExpenseController {
  /**
   * Registers a new expense.
   * Handles single creation or automatic generation of multiple installments.
   */
  static async register(req: Request<{}, {}, ExpenseBody>, res: Response) {
    const { totalInstallments, dueDate, description, amount, installment } =
      req.body;

    try {
      /**
       * Logic for Installments (e.g., 12x).
       * Generates multiple records in the database with incremental due dates.
       */
      if (totalInstallments && totalInstallments > 1) {
        const expensesToCreate: Partial<IExpense>[] = [];
        const parentId = Date.now();

        const installmentAmount = amount / totalInstallments;

        for (let i = 0; i < totalInstallments; i++) {
          const currentDueDate = new Date(dueDate);
          currentDueDate.setMonth(currentDueDate.getMonth() + i);

          // Clean data
          const expenseData: Partial<IExpense> = {
            ...req.body,
            amount: installmentAmount,
            description: `${description} (${i + 1}/${totalInstallments})`,
            dueDate: currentDueDate,
            installment: i + 1,
            totalInstallments: totalInstallments,
            parentId: parentId,
            status: 'pending',
            paymentDate: req.body.paymentDate ?? null,
            observations: req.body.observations
              ? `${req.body.observations} - Total: ${amount}`
              : `Total: ${amount}`,
          };

          expensesToCreate.push(expenseData);
        }

        await Expense.bulkCreate(expensesToCreate as any);

        return res.status(201).json({
          message: `${totalInstallments} parcelas geradas com sucesso!`,
        });
      }

      /**
       * Logic for Single or Recurring initial record.
       * Sets status based on the presence of a payment date.
       */
      const newExpense = await Expense.create({
        ...req.body,
        paymentDate: req.body.paymentDate ?? null,
        observations: req.body.observations ?? '',
        status: req.body.paymentDate ? 'paid' : 'pending',
      } as any);

      return res.status(201).json({
        message: 'Despesa registrada com sucesso!',
        expense: newExpense,
      });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao registrar despesa');
    }
  }

  /**
   * Retrieves all expenses.
   */
  static async getAll(req: Request, res: Response) {
    try {
      const expenses = (await Expense.findAll({
        order: [
          ['dueDate', 'ASC'],
          ['status', 'DESC'],
        ],
      })) as IExpense[];

      return res.status(200).json({ expenses });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao recuperar despesas');
    }
  }

  /**
   * Updates an existing expense record.
   * Handles optional fields to ensure compatibility with strict TypeScript settings.
   */
  static async update(
    req: Request<{ id: string }, {}, ExpenseBody>,
    res: Response,
  ) {
    const { id } = req.params;

    try {
      // Validate if the expense exists in the database
      const expense = await Expense.findByPk(id);

      if (!expense) {
        return res.status(404).json({ message: 'Despesa não encontrada!' });
      }

      /**
       * Prepare update data
       * Prevents overwriting data with 'undefined',
       */
      const updateData = {
        ...req.body,
        paymentDate: req.body.paymentDate ?? expense.paymentDate,
        observations: req.body.observations ?? expense.observations,
        parentId: req.body.parentId ?? expense.parentId,
        installment: req.body.installment ?? expense.installment,
        totalInstallments:
          req.body.totalInstallments ?? expense.totalInstallments,
      };

      await expense.update(updateData as any);

      return res
        .status(200)
        .json({ message: 'Despesa atualizada com sucesso!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao atualizar despesa');
    }
  }

  /**
   * Marks an expense as paid.
   */
  static async pay(
    req: Request<{ id: string }, {}, { paymentDate: string }>,
    res: Response,
  ) {
    const { id } = req.params;
    const { paymentDate } = req.body;

    try {
      const expense = await Expense.findByPk(id);

      if (!expense) {
        return res.status(404).json({ message: 'Despesa não encontrada!' });
      }

      await expense.update({
        status: 'paid',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      });

      return res
        .status(200)
        .json({ message: 'Pagamento da conta registrado!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao baixar despesa');
    }
  }

  /**
   * Logical deletion (Soft Delete).
   */
  static async delete(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;

    try {
      const expense = await Expense.findByPk(id);

      if (!expense) {
        return res.status(404).json({ message: 'Despesa não encontrada!' });
      }

      if (expense.parentId) {
        await Expense.destroy({ where: { parentId: expense.parentId } });

        return res.status(200).json({ message: 'Grupo de despesas excluído!' });
      }

      await expense.destroy();

      return res.status(200).json({ message: 'Despesa excluída!' });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao excluir despesa');
    }
  }

  /**
   * Retrieves expenses by filters (Month/Year).
   */
  static async getByFilters(req: Request, res: Response) {
    const { month, year } = req.query;

    // First and last day
    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

    try {
      const expenses = await Expense.findAll({
        where: {
          dueDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        order: [['dueDate', 'ASC']],
      });

      return res.json({ expenses });
    } catch (error: unknown) {
      return handleControllerError(res, error, 'Erro ao filtrar despesas');
    }
  }
}
