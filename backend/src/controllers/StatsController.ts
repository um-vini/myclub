import { type Request, type Response } from 'express';
import { Sequelize, Op } from 'sequelize';
import Member from '../models/Member.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import type { IPaymentStats } from '../interfaces/Payment.js';
import type { IMemberStats } from '../interfaces/Member.js';
import type { IDashboardResponse } from '../interfaces/DashBoard.js';
import Expense from '../models/Expense.js';
import type { IExpenseStats } from '../interfaces/Expense.js';

export default class StatsController {
  /**
   * Retrieves dashboard statistics including revenue, expected revenue and active member counts.
   */
  static async getAll(
    req: Request<{}, {}, {}, { userId: string; month: string; year: string }>,
    res: Response,
  ) {
    const { userId, month, year } = req.query;
    const y = Number(year);
    const m = Number(month);

    // Filters for payment related statistics
    const whereConditionsPayments = {
      ...(userId && { userId: String(userId) }),
      ...(month && { month: Number(month) }),
      ...(year && { year: Number(year) }),
      status: 'paid',
      category: 'membership',
    };

    // Calculate the last moment of the selected month to filter member history
    const date = new Date(y, m, 0, 23, 59, 59, 999);

    // Filters for member related statistics based on status and creation date
    const whereConditionsMembers = {
      ...(userId && { userId: String(userId) }),
      isActive: true,
      createdAt: {
        [Op.lte]: date,
      },
    };

    try {
      // Calculate real revenue and total unique payments received
      // Note: Sequelize ignores soft-deleted payments (paranoid: true)
      const paymentStats = (await Payment.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount_paid')), 'revenue'],
          [
            Sequelize.fn('COUNT', Sequelize.literal('DISTINCT member_id')),
            'paymentsCount',
          ],
        ],
        where: whereConditionsPayments,
        raw: true,
        nest: true,
      })) as unknown as IPaymentStats[];

      // Aggregate expected revenue based on active plans and member count
      // Note: Member and Plan models use soft delete, so only active/existing records are counted
      const memberStats = (await Member.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('plan.price')), 'expectedRevenue'],
          [
            Sequelize.fn('COUNT', Sequelize.literal('DISTINCT Member.id')),
            'membersCount',
          ],
        ],
        where: whereConditionsMembers,
        include: [
          {
            model: Plan,
            as: 'plan',
            attributes: [],
            required: true, // Ensures only members with non-deleted plans are calculated
          },
        ],
        raw: true,
        nest: true,
      })) as unknown as IMemberStats[];

      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);

      const expenseStats = (await Expense.findAll({
        attributes: [
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'expectedExpense'],
          [
            Sequelize.literal(
              `SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END)`,
            ),
            'expensesPaid',
          ],
        ],
        where: {
          dueDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        raw: true,
        nest: true,
      })) as unknown as IExpenseStats[];

      // Return unified dashboard response
      return res.status(200).json({
        revenue: paymentStats[0]?.revenue || 0,
        paymentsCount: paymentStats[0]?.paymentsCount || 0,
        expectedRevenue: memberStats[0]?.expectedRevenue || 0,
        activeMembers: memberStats[0]?.membersCount || 0,
        expectedExpense: expenseStats[0]?.expectedExpense || 0,
        expensesPaid: expenseStats[0]?.expensesPaid || 0,
        netBalance:
          Number(paymentStats[0]?.revenue) -
            Number(expenseStats[0]?.expectedExpense) || 0,
      } as IDashboardResponse);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return res.status(500).json({
        message: 'Erro ao recuperar estatísticas do painel',
        error: message,
      });
    }
  }
}
