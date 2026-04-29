import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function StatCard({ title, value, subtitle, icon: Icon, colorClass, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-text-muted text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-text-dark">{value}</h3>
          {subtitle && (
            <p className="text-xs text-text-muted mt-2 mt-1 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={clsx("p-3 rounded-xl", colorClass)}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
}
