import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface UserPointsBalance {
  user_id: string;
  total_points: number;
}

export interface PointsLedgerEntry {
  id: number;
  user_id: string;
  order_id: string | null;
  reward_id: number | null;
  points: number;
  type: string | null;
  created_at: Date;
  order_number?: string;
}

@Injectable()
export class PointsService {
  private readonly logger = new Logger(PointsService.name);

  constructor(private readonly prisma: PrismaService) {}

    async getUserPointsBalance(userId: string): Promise<UserPointsBalance | null> {
    try {
      // Try to query the user_points_balance view first
      try {
        const result = await this.prisma.$queryRaw<Array<{ user_id: string; total_points: number }>>`
          SELECT user_id, total_points 
          FROM user_points_balance 
          WHERE user_id = ${userId}::uuid
        `;

        if (result.length > 0) {
          return result[0];
        }
      } catch (viewError) {
        this.logger.warn(`user_points_balance view not found, using fallback query:`, viewError);
      }

      // Fallback: calculate points directly from points_ledger
      const result = await this.prisma.points_ledger.aggregate({
        where: {
          user_id: userId,
        },
        _sum: {
          points: true,
        },
      });

      const totalPoints = result._sum.points || 0;
      
      const response = {
        user_id: userId,
        total_points: totalPoints,
      };

      // Serialize BigInt values for JSON response
      return JSON.parse(
        JSON.stringify(response, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      );
    } catch (error) {
      this.logger.error(`Error fetching points balance for user ${userId}:`, error);
      return null;
    }
  }

  async getUserPointsLedger(userId: string): Promise<PointsLedgerEntry[]> {
    try {
      // Get points ledger entries with order information
      const entries = await this.prisma.points_ledger.findMany({
        where: {
          user_id: userId,
        },
        include: {
          orders: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      // Transform the data to include order numbers and format for frontend
      const transformedEntries = entries.map(entry => ({
        id: entry.id,
        user_id: entry.user_id!,
        order_id: entry.order_id,
        reward_id: entry.reward_id,
        points: entry.points,
        type: entry.type,
        created_at: entry.created_at!,
        order_number: entry.orders?.id ? `#${String(entry.orders.id).slice(-8)}` : undefined,
      }));

      // Serialize BigInt values for JSON response
      return JSON.parse(
        JSON.stringify(transformedEntries, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      ) as PointsLedgerEntry[];
    } catch (error) {
      this.logger.error(`Error fetching points ledger for user ${userId}:`, error);
      return [];
    }
  }

  async getPointsSummary(userId: string): Promise<{
    balance: UserPointsBalance | null;
    transactions: PointsLedgerEntry[];
  }> {
    try {
      const [balance, transactions] = await Promise.all([
        this.getUserPointsBalance(userId),
        this.getUserPointsLedger(userId),
      ]);

      const result = {
        balance,
        transactions,
      };

      // Serialize BigInt values for JSON response
      return JSON.parse(
        JSON.stringify(result, (key, value) =>
          typeof value === 'bigint' ? Number(value) : value,
        ),
      );
    } catch (error) {
      this.logger.error(`Error fetching points summary for user ${userId}:`, error);
      return {
        balance: null,
        transactions: [],
      };
    }
  }
}
