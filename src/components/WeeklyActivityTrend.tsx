import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

interface DayActivity {
  day: string;
  date: string;
  academics: number;
  exam: number;
  wellness: number;
  rest: number;
}

const WEEKLY_DATA: DayActivity[] = [
  { day: 'Wed', date: 'Oct 8', academics: 5.5, exam: 3.0, wellness: 2.0, rest: 8.5 },
  { day: 'Thu', date: 'Oct 9', academics: 6.0, exam: 2.5, wellness: 1.5, rest: 8.0 },
  { day: 'Fri', date: 'Oct 10', academics: 5.0, exam: 3.5, wellness: 2.0, rest: 7.5 },
  { day: 'Sat', date: 'Oct 11', academics: 2.0, exam: 5.0, wellness: 2.5, rest: 9.0 },
  { day: 'Sun', date: 'Oct 12', academics: 1.5, exam: 4.5, wellness: 3.0, rest: 9.5 },
  { day: 'Mon', date: 'Oct 13', academics: 5.5, exam: 3.0, wellness: 2.0, rest: 8.0 },
  { day: 'Today', date: 'Oct 14', academics: 5.5, exam: 3.0, wellness: 2.0, rest: 8.0 },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalHours = payload.reduce((acc, p) => acc + (p.value || 0), 0);
    return (
      <div className="bg-surface-container-lowest/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-outline-variant/40 space-y-1.5 text-xs z-50">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-1 gap-4">
          <span className="font-headline font-bold text-on-surface">{label}</span>
          <span className="font-label-time text-[11px] font-bold text-secondary">
            {totalHours.toFixed(1)}h Total
          </span>
        </div>
        <div className="space-y-1">
          {payload.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-on-surface-variant font-medium">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </span>
              <span className="font-metric-display font-semibold text-on-surface">
                {item.value}h
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const WeeklyActivityTrend: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Weekly aggregates
  const totalFocusWeek = WEEKLY_DATA.reduce(
    (acc, d) => acc + d.academics + d.exam,
    0
  );
  const avgFocusPerDay = (totalFocusWeek / 7).toFixed(1);

  return (
    <section className="flex flex-col bg-surface-container rounded-2xl p-4 shadow-md gap-3 border border-outline-variant/30">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[20px]">
            stacked_bar_chart
          </span>
          <div>
            <h3 className="font-headline text-base text-on-surface font-bold">
              Weekly Activity Trend
            </h3>
            <p className="font-body text-[11px] text-on-surface-variant">
              Category distribution over the last 7 days
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-semibold block">
            Avg Daily Focus
          </span>
          <span className="font-metric-display text-xs text-primary font-bold">
            {avgFocusPerDay}h / day
          </span>
        </div>
      </div>

      {/* Recharts Stacked Bar Chart */}
      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={WEEKLY_DATA}
            margin={{ top: 10, right: 6, left: -24, bottom: 0 }}
            barCategoryGap={8}
          >
            <XAxis
              dataKey="day"
              stroke="#77767c"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#c7c6cc', strokeOpacity: 0.4 }}
              fontFamily="JetBrains Mono"
            />
            <YAxis
              stroke="#77767c"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, 24]}
              tickFormatter={(v) => `${v}h`}
              fontFamily="JetBrains Mono"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={7}
              wrapperStyle={{
                fontSize: '11px',
                fontFamily: 'Plus Jakarta Sans',
                paddingBottom: '8px',
              }}
            />
            {/* Rest & Sleep */}
            <Bar
              dataKey="rest"
              name="Rest & Downtime"
              stackId="a"
              fill="#727481"
              opacity={selectedCategory && selectedCategory !== 'rest' ? 0.35 : 0.9}
              radius={[0, 0, 0, 0]}
              onMouseEnter={() => setSelectedCategory('rest')}
              onMouseLeave={() => setSelectedCategory(null)}
            />
            {/* Wellness & Fitness */}
            <Bar
              dataKey="wellness"
              name="Wellness & Motion"
              stackId="a"
              fill="#56615d"
              opacity={selectedCategory && selectedCategory !== 'wellness' ? 0.35 : 0.9}
              radius={[0, 0, 0, 0]}
              onMouseEnter={() => setSelectedCategory('wellness')}
              onMouseLeave={() => setSelectedCategory(null)}
            />
            {/* Gov Exam Prep */}
            <Bar
              dataKey="exam"
              name="Gov Exam Prep"
              stackId="a"
              fill="#5d5c59"
              opacity={selectedCategory && selectedCategory !== 'exam' ? 0.35 : 0.9}
              radius={[0, 0, 0, 0]}
              onMouseEnter={() => setSelectedCategory('exam')}
              onMouseLeave={() => setSelectedCategory(null)}
            />
            {/* University Academics */}
            <Bar
              dataKey="academics"
              name="University Academics"
              stackId="a"
              fill="#595b68"
              opacity={selectedCategory && selectedCategory !== 'academics' ? 0.35 : 1}
              radius={[4, 4, 0, 0]}
              onMouseEnter={() => setSelectedCategory('academics')}
              onMouseLeave={() => setSelectedCategory(null)}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 7-Day Trend Insights Footer */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-outline-variant/30">
        <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-bold block">
              Weekend Sprint
            </span>
            <span className="font-body text-[11px] text-on-surface font-semibold truncate block">
              +2.5h Exam Deep Work
            </span>
          </div>
        </div>

        <div className="bg-surface-container-low p-2 rounded-xl border border-outline-variant/20 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </div>
          <div className="min-w-0">
            <span className="font-label-badge text-[10px] text-on-surface-variant uppercase font-bold block">
              Burnout Defense
            </span>
            <span className="font-body text-[11px] text-secondary font-bold truncate block">
              100% Rest Protected
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
