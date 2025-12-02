import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Supplement, NewSupplementInput, DayProgress } from './types';
import Header from './components/Header';
import SupplementCard from './components/SupplementCard';
import AddModal from './components/AddModal';
import { Plus, BellRing } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Load data and handle day reset
  useEffect(() => {
    // Check initial permission status safely
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }

    const savedData = localStorage.getItem('vitaflow_data');
    const lastOpenedDate = localStorage.getItem('vitaflow_date');
    const today = new Date().toDateString();

    let initialData: Supplement[] = [];

    if (savedData) {
      initialData = JSON.parse(savedData);
    } else {
        initialData = [
            { id: '1', name: 'Vitamin D3', dosage: '2000 IU', frequency: 'Morning', taken: false, category: 'vitamin', reminderTime: '08:00' },
            { id: '2', name: 'Magnesium', dosage: '400mg', frequency: 'Night', taken: false, category: 'vitamin', notes: 'Helps with sleep', reminderTime: '22:00' },
        ];
    }

    if (lastOpenedDate !== today) {
      initialData = initialData.map(s => ({ ...s, taken: false }));
      localStorage.setItem('vitaflow_date', today);
    }

    setSupplements(initialData);
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('vitaflow_data', JSON.stringify(supplements));
  }, [supplements]);

  // Request Notification Permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      // iOS PWA requires 'standalone' mode for notifications to work.
      // If the app is running in standard Safari, this might be false or permissions might always be denied.
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert("请将此网页添加到主屏幕以启用通知功能 (分享 -> 添加到主屏幕)");
      } else {
        alert("此浏览器不支持通知功能");
      }
      return;
    }

    try {
      // iOS requires the promise syntax rather than the callback syntax
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        // Send a test notification immediately to confirm
        try {
          new Notification('VitaFlow', { body: '提醒已开启，我们将按时提醒您服用补剂。' });
        } catch (e) {
          console.error("Test notification failed", e);
        }
      } else if (permission === 'denied') {
        alert("您拒绝了通知权限。请在系统设置中允许 VitaFlow 发送通知。");
      }
    } catch (error) {
      console.error("Permission request error", error);
      // Fallback for older browsers
      Notification.requestPermission((permission) => {
        setNotificationPermission(permission);
      });
    }
  };

  // Check for reminders every minute
  useEffect(() => {
    if (notificationPermission !== 'granted') return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:MM

      supplements.forEach(item => {
        if (item.reminderTime === currentTime && !item.taken) {
          try {
             new Notification(`该吃补剂了: ${item.name}`, {
              body: `用量: ${item.dosage}。 ${item.notes || ''}`,
              icon: '/icon.png', // Note: Make sure icon path is valid in production
              tag: item.id + currentTime // Simple tag to prevent duplicates in same minute
            });
          } catch (e) {
            console.error("Notification trigger failed", e);
          }
        }
      });
    };

    const intervalId = setInterval(checkReminders, 60000); // Check every minute
    
    // Initial check immediately (aligned to next minute for precision would be better, but immediate for testing)
    const now = new Date();
    if (now.getSeconds() === 0) checkReminders();

    return () => clearInterval(intervalId);
  }, [supplements, notificationPermission]);


  const toggleSupplement = (id: string) => {
    setSupplements(prev => 
      prev.map(item => 
        item.id === id ? { ...item, taken: !item.taken } : item
      )
    );
  };

  const deleteSupplement = (id: string) => {
    // The confirmation dialog is now handled inside SupplementCard to ensure UI responsiveness
    // and preventing event propagation issues.
    setSupplements(prev => prev.filter(item => item.id !== id));
  };

  const handleAddSupplements = (newItems: NewSupplementInput[]) => {
    const itemsWithIds: Supplement[] = newItems.map(item => ({
      ...item,
      id: generateId(),
      taken: false
    }));
    setSupplements(prev => [...prev, ...itemsWithIds]);
  };

  const progress: DayProgress = useMemo(() => {
    const total = supplements.length;
    const completed = supplements.filter(s => s.taken).length;
    return {
      total,
      completed,
      percentage: total === 0 ? 0 : (completed / total) * 100
    };
  }, [supplements]);

  const sortedSupplements = useMemo(() => {
      return [...supplements].sort((a, b) => {
          if (a.taken === b.taken) return 0;
          return a.taken ? 1 : -1;
      });
  }, [supplements]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header progress={progress} />

      {/* Notification Permission Banner for iOS PWA */}
      {notificationPermission === 'default' && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <button 
            onClick={requestNotificationPermission}
            className="w-full bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                <BellRing className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-indigo-900">开启提醒通知</h3>
                <p className="text-xs text-indigo-600">不再错过任何一次补剂服用时间</p>
              </div>
            </div>
            <span className="text-xs font-medium text-indigo-500 bg-white px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              开启
            </span>
          </button>
        </div>
      )}
       {/* Permission Denied Message */}
       {notificationPermission === 'denied' && (
        <div className="max-w-md mx-auto px-4 mb-4">
          <div className="w-full bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3">
             <div className="bg-red-100 p-2 rounded-lg text-red-600">
                <BellRing className="w-5 h-5" />
              </div>
            <div className="text-left">
                <h3 className="text-sm font-semibold text-red-900">通知已被禁用</h3>
                <p className="text-xs text-red-600">请在手机设置中允许通知以接收提醒</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-md mx-auto px-4">
        <div className="space-y-1">
          {sortedSupplements.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
               <p className="mb-4">还没有添加任何补剂</p>
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="text-emerald-500 font-medium hover:underline"
                >
                    点击添加
                </button>
            </div>
          ) : (
            sortedSupplements.map(item => (
                <SupplementCard
                key={item.id}
                item={item}
                onToggle={toggleSupplement}
                onDelete={deleteSupplement}
                />
            ))
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-40 md:right-[calc(50%-14rem)]">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-4 shadow-lg shadow-emerald-200 transition-all hover:scale-110 active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-6 h-6" />
          <span className="font-medium pr-1 hidden sm:inline">记录</span>
        </button>
      </div>

      <AddModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddSupplements}
      />
    </div>
  );
};

export default App;