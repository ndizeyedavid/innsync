import { PrismaService } from 'src/infrastructure/prisma/prisma.service';

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  skip: number;
  take: number;
  hasMore: boolean;
}

export async function paginate<T>(
  prisma: PrismaService,
  model: string,
  args: {
    where?: any;
    orderBy?: any;
    include?: any;
    select?: any;
    skip?: number;
    take?: number;
  },
): Promise<PaginatedResult<T>> {
  const skip = args.skip ?? 0;
  const take = args.take ?? 50;
  const [items, total] = await prisma.$transaction([
    (prisma as any)[model].findMany({ ...args, skip, take }),
    (prisma as any)[model].count({ where: args.where }),
  ]);
  return { items, total, skip, take, hasMore: skip + take < total };
}
