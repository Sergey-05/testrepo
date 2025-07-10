'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  TooltipProps,
} from 'recharts';
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';
import { useState, useEffect } from 'react';

interface ProfitChartProps {
  profitData: { name: string; value: number }[];
  deposit: number;
  depositCount: number;
  referralProfit: number;
  lastCollectedAt: Date | null;
  currentTariff: Tariff | null;
  totalReferrals: number;
}

interface Tariff {
  name: string;
  rate: number;
  amountMin?: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export function ProfitChart({
  profitData,
  deposit,
  depositCount,
  referralProfit,
  lastCollectedAt,
  currentTariff,
  totalReferrals,
}: ProfitChartProps) {
  const [timeToCollect, setTimeToCollect] = useState('00:00:00');
  const [serverTimeMs, setServerTimeMs] = useState<number | null>(null);

  // Расчет ожидаемой прибыли (процент по депозиту за 24 часа)
  const pendingProfit = currentTariff
    ? +((deposit * (currentTariff.rate ?? 0)) / 100).toFixed(2)
    : 0;

  // Фильтрация некорректных данных
  const filteredProfitData = profitData.filter(
    (d) => Number.isFinite(d.value) && !isNaN(d.value),
  );

  useEffect(() => {
    // Fetch server time once on mount
    const fetchServerTime = async () => {
      try {
        const response = await fetch('/api/health');
        const serverTimeHeader = response.headers.get('Date');
        if (serverTimeHeader) {
          const newServerTimeMs = new Date(serverTimeHeader).getTime();
          setServerTimeMs(newServerTimeMs);
        } else {
          throw new Error('No Date header in response');
        }
      } catch (error) {
        console.error('ProfitChart: Error Fetching Server Time', { error });
        setTimeToCollect('00:00:00');
      }
    };
    fetchServerTime();
  }, []);

  useEffect(() => {
    if (!lastCollectedAt || deposit <= 0 || serverTimeMs === null) {
      setTimeToCollect('00:00:00');
      return;
    }

    const updateTimer = () => {
      const lastCollected = new Date(lastCollectedAt).getTime();
      const diffMs = 24 * 60 * 60 * 1000 - (serverTimeMs - lastCollected);

      if (diffMs <= 0 || diffMs >= 24 * 60 * 60 * 1000) {
        setTimeToCollect('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      const newTimeToCollect = `${hours
        .toString()
        .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
        .toString()
        .padStart(2, '0')}`;
      setTimeToCollect(newTimeToCollect);
    };

    updateTimer(); // Initial call
    const intervalId = setInterval(() => {
      setServerTimeMs((prev) => {
        const newTimeMs = prev ? prev + 1000 : null;
        return newTimeMs;
      });
      updateTimer();
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [lastCollectedAt, deposit, serverTimeMs, timeToCollect]);

  const statsGroups = [
    [
      { label: 'Баланс в трейдинге', value: '' },
      { label: '', value: `${(deposit || 0).toLocaleString('ru-RU')} ₽` },
      { label: '', value: `Активных вкладов: ${depositCount}` },
    ],
    [
      { label: 'Ожидает снятия', value: '' },
      { label: '', value: `${pendingProfit.toLocaleString('ru-RU')} ₽` },
      { label: '', value: `До снятия: ${timeToCollect}` },
    ],
    [
      { label: 'Заработано с партнеров', value: '' },
      {
        label: '',
        value: `${(referralProfit || 0).toLocaleString('ru-RU')} ₽`,
      },
      { label: '', value: `Всего партнеров: ${totalReferrals}` },
    ],
  ];

  // Кастомный Tooltip
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const value = Number(payload[0].value);
      return (
        <div className='rounded bg-[#18181b] p-2 text-[10px] text-white'>
          <p>{`Дата: ${label}`}</p>
          <p>{`Прибыль: ${isNaN(value) ? '0.00' : value.toLocaleString('ru-RU')} ₽`}</p>
        </div>
      );
    }
    return null;
  };

  // Форматирование больших чисел для Y-оси
  const formatYAxis = (value: number) => {
    if (!Number.isFinite(value) || isNaN(value)) return '0 ₽';
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(0)}M ₽`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(0)}K ₽`;
    }
    return `${Math.round(value)} ₽`;
  };

  // Динамический максимум для Y-оси
  const validValues = filteredProfitData
    .map((d) => d.value)
    .filter((v) => Number.isFinite(v) && !isNaN(v));
  const maxProfit = validValues.length > 0 ? Math.max(...validValues, 10) : 10;
  const yAxisDomain = [0, maxProfit * 1.1];

  return (
    <div className='rounded-lg border border-zinc-800/50 bg-zinc-900/80 p-3'>
      {/* Заголовок */}
      <div className='mb-2 flex items-center gap-1'>
        <div className='h-1.5 w-1.5 rounded-full bg-purple-500' />
        <p className='text-[10px] font-semibold uppercase tracking-wide text-zinc-400'>
          Статистика терминала
        </p>
      </div>

      {/* График */}
      <div className='h-32'>
        <ResponsiveContainer width='100%' height='100%'>
          <AreaChart
            data={profitData}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient id='colorProfit' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.6} />
                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke='#3f3f46'
              strokeOpacity={0.2}
              vertical={false}
            />
            <XAxis
              dataKey='name'
              tick={{ fill: '#a1a1aa', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              padding={{ left: 10 }}
            />
            <YAxis
              tick={{ fill: '#a1a1aa', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              width={60}
              domain={yAxisDomain}
              tickFormatter={formatYAxis}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='value'
              stroke='#8b5cf6'
              fill='url(#colorProfit)'
              strokeWidth={2}
              dot={{ r: 2, fill: '#8b5cf6' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Список статистики */}
      <div className='mt-2'>
        {statsGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className='flex items-center justify-between border-t border-zinc-800/50 py-1 first:border-t-0'
          >
            <div className='flex flex-col'>
              {group.map((stat, index) => (
                <div key={index} className='flex flex-col'>
                  <span className='text-[10px] text-zinc-400'>
                    {stat.label}
                  </span>
                  {stat.value && (
                    <span className='text-[10px] text-white'>{stat.value}</span>
                  )}
                </div>
              ))}
            </div>
            <div className='relative h-4 w-4 rounded bg-purple-500/20'>
              <svg className='absolute inset-0 h-4 w-4'>
                <circle
                  cx='8'
                  cy='8'
                  r='4'
                  fill='#8b5cf6'
                  stroke='#8b5cf6'
                  strokeWidth='1'
                />
                <circle
                  cx='8'
                  cy='8'
                  r='6'
                  fill='none'
                  stroke='#8b5cf6'
                  strokeWidth='0.5'
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
