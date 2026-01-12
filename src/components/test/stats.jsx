import { Calendar, Flame, Inbox, PhoneMissed, ThumbsUp, Users, MessageCircle, TrendingUp, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';

const StatsComponent = ({ overallStats = {}, filters, activeRole }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const getStatsCards = () => {
    const stats = overallStats || {};
    
    return [
      {
        label: "Fresh Leads",
        count: stats.freshLeads || 47,
        subText: "New inquiries today",
        icon: <Inbox size={20} />,
        color: "from-blue-500 to-blue-600",
        bgGradient: "from-blue-50 to-blue-100",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        borderColor: "border-blue-200",
        shadowColor: "shadow-blue-500/10"
      },
      {
        label: "Today Callbacks",
        count: stats.todayCallbacks || 23,
        subText: "Due in next 2 hours",
        icon: <Calendar size={20} />,
        color: "from-emerald-500 to-emerald-600",
        bgGradient: "from-emerald-50 to-emerald-100",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        borderColor: "border-emerald-200",
        shadowColor: "shadow-emerald-500/10"
      },
      {
        label: "Hot Prospects",
        count: stats.intentHot || 15,
        subText: "Ready to close",
        icon: <Flame size={20} />,
        color: "from-orange-500 to-orange-600",
        bgGradient: "from-orange-50 to-orange-100",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        borderColor: "border-orange-200",
        shadowColor: "shadow-orange-500/10",
        priority: true
      },
      {
        label: "Warm Leads",
        count: stats.intentWarm || 32,
        subText: "Nurturing required",
        icon: <ThumbsUp size={20} />,
        color: "from-amber-500 to-amber-600",
        bgGradient: "from-amber-50 to-amber-100",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        borderColor: "border-amber-200",
        shadowColor: "shadow-amber-500/10"
      },
      {
        label: "Missed Connections",
        count: stats.notConnectedYet || 8,
        subText: "Follow up needed",
        icon: <PhoneMissed size={20} />,
        color: "from-rose-500 to-rose-600",
        bgGradient: "from-rose-50 to-rose-100",
        iconBg: "bg-rose-100",
        iconColor: "text-rose-600",
        borderColor: "border-rose-200",
        shadowColor: "shadow-rose-500/10",
        priority: true
      },
      {
        label: "Total Pipeline",
        count: stats.total || 125,
        subText: "Active opportunities",
        icon: <Users size={20} />,
        color: "from-indigo-500 to-indigo-600",
        bgGradient: "from-indigo-50 to-indigo-100",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600",
        borderColor: "border-indigo-200",
        shadowColor: "shadow-indigo-500/10"
      },
      {
        label: "Unread Messages",
        count: stats.unreadMessages?.leadsWithUnread || 12,
        subText: "Awaiting response",
        icon: <MessageCircle size={20} />,
        color: "from-purple-500 to-purple-600",
        bgGradient: "from-purple-50 to-purple-100",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600",
        borderColor: "border-purple-200",
        shadowColor: "shadow-purple-500/10"
      }
    ];
  };

  return (
    <div className="w-full p-4 ">
      

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6">
        {getStatsCards().map((stat, index) => {
          const isHovered = hoveredCard === index;
          
          return (
            <div
              key={index}
              className={`group relative cursor-pointer transition-all duration-300 ease-out transform ${
                isHovered ? 'scale-[1.02] -translate-y-1' : 'scale-100'
              }`}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Priority indicator */}
              {stat.priority && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="relative">
                    <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
                  </div>
                </div>
              )}
              
              {/* Main card */}
              <div className={`
                relative overflow-hidden rounded-2xl border-2 ${stat.borderColor}
                bg-gradient-to-br ${stat.bgGradient} backdrop-blur-sm
                shadow-lg hover:shadow-xl ${stat.shadowColor}
                transition-all duration-300 ease-out
                ${isHovered ? `shadow-2xl ${stat.shadowColor.replace('/10', '/20')}` : ''}
                min-h-[140px] sm:min-h-[160px]
              `}>
                
                {/* Content */}
                <div className="relative p-5 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <h3 className="text-sm font-semibold text-gray-700 truncate mb-1">
                        {stat.label}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed">
                        {stat.subText}
                      </p>
                    </div>
                    
                    {/* Icon */}
                    <div className={`
                      flex-shrink-0 p-3 rounded-xl ${stat.iconBg} ${stat.iconColor}
                      transition-all duration-300 ease-out shadow-sm
                      ${isHovered ? 'transform rotate-6 scale-110 shadow-md' : ''}
                    `}>
                      {stat.icon}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-end justify-between">
                    <div className="flex-1">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-800 tracking-tight mb-1">
                        {stat.count.toLocaleString()}
                      </div>
                      
                      {/* Status indicator */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-xs font-medium text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          Active
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover action */}
                    <div className={`
                      transition-all duration-300 ease-out
                      ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3'}
                    `}>
                      <div className="p-2 rounded-lg bg-white/50 backdrop-blur-sm">
                        <ArrowUpRight size={16} className="text-gray-600" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bottom accent line */}
                <div className={`
                  absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 ease-out
                  ${isHovered ? 'w-full' : 'w-0'} ${stat.color}
                `}></div>
                
                {/* Subtle pattern overlay */}
                <div className={`
                  absolute top-0 right-0 w-32 h-32 opacity-5
                  bg-gradient-to-bl ${stat.color} rounded-full
                  transform translate-x-16 -translate-y-16
                  transition-transform duration-700 ease-out
                  ${isHovered ? 'scale-150' : 'scale-100'}
                `}></div>
              </div>
            </div>
          );
        })}
      </div>
      
    
    </div>
  );
};

export default StatsComponent;