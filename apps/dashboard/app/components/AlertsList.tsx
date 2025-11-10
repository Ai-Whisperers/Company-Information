'use client';

interface Alert {
  repository: string;
  health_score: number;
  issues: string[];
  url: string;
  scan_time: string;
}

interface AlertsListProps {
  alerts: Alert[];
}

export function AlertsList({ alerts }: AlertsListProps) {
  const getSeverity = (score: number): 'critical' | 'warning' | 'info' => {
    if (score < 50) return 'critical';
    if (score < 70) return 'warning';
    return 'info';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
        <p className="text-gray-500">All repositories are operating within healthy parameters</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => {
        const severity = getSeverity(alert.health_score);
        return (
          <div
            key={`${alert.repository}-${index}`}
            className={`border rounded-lg p-4 ${getSeverityColor(severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-2xl">{getSeverityIcon(severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{alert.repository}</h4>
                    <span className="px-2 py-1 bg-white rounded-full text-xs font-bold">
                      Health: {alert.health_score}/100
                    </span>
                  </div>
                  <ul className="space-y-1 mb-2">
                    {alert.issues.map((issue, i) => (
                      <li key={i} className="text-sm flex items-center space-x-2">
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center space-x-4 text-xs text-gray-600">
                    <span>{formatTime(alert.scan_time)}</span>
                    <a
                      href={alert.url || `https://github.com/Ai-Whisperers/${alert.repository}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Repository →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
