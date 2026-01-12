import Dexie from 'dexie';

class NotificationDB extends Dexie {
    constructor() {
        super('LMSNotificationsDB');

        this.version(1).stores({
            whatsapp: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at',
            leads: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at',
            callbacks: '++id, notification_id, timestamp, read, counsellor_id, created_at',
            processed: '&key, timestamp'
        });

        this.version(2).stores({
            whatsapp: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at, expires_at',
            leads: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at, expires_at',
            callbacks: '++id, notification_id, timestamp, read, counsellor_id, created_at, expires_at',
            processed: '&key, timestamp, expires_at'
        }).upgrade(async (tx) => {
            const tables = ['whatsapp', 'leads', 'callbacks', 'processed'];
            for (const tableName of tables) {
                const table = tx.table(tableName);
                const records = await table.toArray();
                for (const record of records) {
                    const created = new Date(record.created_at || record.timestamp || Date.now());
                    record.expires_at = new Date(created.getTime() + 7 * 24 * 60 * 60 * 1000);
                    await table.put(record);
                }
            }
        });

        this.version(3).stores({
            whatsapp: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at, expires_at',
            leads: '++id, notification_id, student_id, timestamp, read, counsellor_id, created_at, expires_at',
            callbacks: '++id, notification_id, timestamp, read, counsellor_id, created_at, expires_at',
            processed: '&key, timestamp, expires_at'
        }).upgrade(async (tx) => {
            console.log('Migrating to version 3...');
        });
    }

    async storeWhatsApp(notification) {
        try {
            await this.transaction('rw', this.whatsapp, this.processed, async () => {
                const key = `whatsapp_${notification.id || notification.student_id}_${notification.timestamp}_${Date.now()}`;

                const exists = await this.processed.get(key);
                if (exists) {
                    console.log('WhatsApp notification already processed');
                    return;
                }

                await this.processed.put({
                    key,
                    timestamp: Date.now(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                const notificationId = notification.id || `whatsapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${notification.student_id}`;
                
                await this.whatsapp.put({
                    notification_id: notificationId,
                    student_id: notification.student_id,
                    student_name: notification.student_name,
                    student_phone: notification.student_phone,
                    counsellor_id: notification.counsellor_id,
                    message: notification.message,
                    message_preview: notification.message?.substring(0, 60) || 'New WhatsApp message',
                    timestamp: new Date(notification.timestamp || Date.now()),
                    read: false,
                    urgency: notification.urgency || 'medium',
                    source: 'whatsapp',
                    waba_number: notification.waba_number,
                    created_at: new Date(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                await this.cleanupTable('whatsapp');
                await this.cleanupTable('processed');
            });

            console.log('WhatsApp notification stored in IndexedDB');
        } catch (error) {
            console.error('Error storing WhatsApp notification:', error);
        }
    }

    async storeLead(notification) {
        try {
            await this.transaction('rw', this.leads, this.processed, async () => {
                const key = `lead_${notification.id || notification.student_id}_${notification.timestamp}_${Date.now()}`;

                const exists = await this.processed.get(key);
                if (exists) {
                    console.log('Lead notification already processed');
                    return;
                }

                await this.processed.put({
                    key,
                    timestamp: Date.now(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                const notificationId = notification.id || `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${notification.student_id}`;
                
                await this.leads.put({
                    notification_id: notificationId,
                    student_id: notification.student_id,
                    student_name: notification.student_name,
                    student_phone: notification.student_phone,
                    source: notification.source,
                    notification_type: notification.notification_type,
                    is_premium: notification.notification_type === 'premium_lead',
                    timestamp: new Date(notification.timestamp || Date.now()),
                    read: false,
                    counsellor_id: notification.counsellorId,
                    created_at: new Date(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                await this.cleanupTable('leads');
                await this.cleanupTable('processed');
            });

            console.log('Lead notification stored in IndexedDB');
        } catch (error) {
            console.error('Error storing lead notification:', error);
        }
    }

    async storeCallback(notification) {
        try {
            await this.transaction('rw', this.callbacks, this.processed, async () => {
                const key = `callback_${notification.id || notification.target_time}_${Date.now()}`;

                const exists = await this.processed.get(key);
                if (exists) {
                    console.log('Callback notification already processed');
                    return;
                }

                await this.processed.put({
                    key,
                    timestamp: Date.now(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                const notificationId = notification.id || `callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                await this.callbacks.put({
                    notification_id: notificationId,
                    target_time: notification.target_time,
                    students: JSON.stringify(notification.students || []),
                    count: notification.count || 0,
                    timestamp: new Date(notification.timestamp || Date.now()),
                    read: false,
                    is_urgent: notification.is_urgent || false,
                    student_names: JSON.stringify(notification.student_names || []),
                    counsellor_id: notification.counsellorId,
                    created_at: new Date(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                await this.cleanupTable('callbacks');
                await this.cleanupTable('processed');
            });

            console.log('Callback notification stored in IndexedDB');
        } catch (error) {
            console.error('Error storing callback notification:', error);
        }
    }

    async getNotifications(type, limit = 50) {
        try {
            const table = this[type];
            if (!table) {
                console.error(`Table ${type} not found`);
                return [];
            }

            const notifications = await table
                .orderBy('timestamp')
                .reverse()
                .limit(limit)
                .toArray();

            return notifications.map(n => ({
                ...n,
                timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
                created_at: n.created_at instanceof Date ? n.created_at.toISOString() : n.created_at,
                expires_at: n.expires_at instanceof Date ? n.expires_at.toISOString() : n.expires_at
            }));
        } catch (error) {
            console.error(`Error getting ${type} notifications:`, error);
            return [];
        }
    }

    async getUnreadCount(type) {
        try {
            const table = this[type];
            if (!table) {
                console.error(`Table ${type} not found`);
                return 0;
            }

            const count = await table
                .where('read')
                .equals(0)
                .count();

            console.log(`Unread count for ${type}:`, count);
            return count;
        } catch (error) {
            console.error(`Error getting unread count for ${type}:`, error);
            
            try {
                const all = await table.toArray();
                const unread = all.filter(n => !n.read).length;
                console.log(`Fallback unread count for ${type}:`, unread);
                return unread;
            } catch (fallbackError) {
                console.error(`Fallback also failed for ${type}:`, fallbackError);
                return 0;
            }
        }
    }

    async markAsRead(type, notificationId) {
        try {
            const table = this[type];
            if (!table) return;

            await table
                .where('notification_id')
                .equals(notificationId)
                .modify({ read: 1 });

            console.log(`Marked ${type} notification ${notificationId} as read`);
        } catch (error) {
            console.error(`Error marking ${type} notification as read:`, error);
        }
    }

    async markAllAsRead(type) {
        try {
            const table = this[type];
            if (!table) return;

            await table
                .where('read')
                .equals(0)
                .modify({ read: 1 });

            console.log(`Marked all ${type} notifications as read`);
        } catch (error) {
            console.error(`Error marking all ${type} notifications as read:`, error);
        }
    }

    async deleteNotification(type, notificationId) {
        try {
            const table = this[type];
            if (!table) return;

            await table
                .where('notification_id')
                .equals(notificationId)
                .delete();

            console.log(`Deleted ${type} notification ${notificationId}`);
        } catch (error) {
            console.error(`Error deleting ${type} notification:`, error);
        }
    }

    async clearAll(type) {
        try {
            const table = this[type];
            if (!table) return;

            await table.clear();
            console.log(`Cleared all ${type} notifications`);
        } catch (error) {
            console.error(`Error clearing ${type} notifications:`, error);
        }
    }

    async cleanupTable(tableName) {
        try {
            const table = this[tableName];
            if (!table) return;

            const now = new Date();
            await table
                .where('expires_at')
                .below(now)
                .delete();

            if (tableName === 'processed') {
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                await table
                    .where('timestamp')
                    .below(weekAgo)
                    .delete();
            }
        } catch (error) {
            console.error(`Error cleaning up ${tableName}:`, error);
        }
    }

    async debugUnreadCounts() {
        try {
            console.log('=== DEBUG UNREAD COUNTS ===');
            
            const [whatsappCount, leadsCount, callbacksCount] = await Promise.all([
                this.getUnreadCount('whatsapp'),
                this.getUnreadCount('leads'),
                this.getUnreadCount('callbacks')
            ]);

            const [whatsappAll, leadsAll, callbacksAll] = await Promise.all([
                this.whatsapp.toArray(),
                this.leads.toArray(),
                this.callbacks.toArray()
            ]);

            console.log('📱 WhatsApp:', {
                total: whatsappAll.length,
                unread: whatsappCount,
                unreadCalculated: whatsappAll.filter(n => !n.read).length,
                sample: whatsappAll.slice(0, 3).map(n => ({ 
                    id: n.notification_id, 
                    read: n.read,
                    student: n.student_name 
                }))
            });

            console.log('📝 Leads:', {
                total: leadsAll.length,
                unread: leadsCount,
                unreadCalculated: leadsAll.filter(n => !n.read).length,
                sample: leadsAll.slice(0, 3).map(n => ({ 
                    id: n.notification_id, 
                    read: n.read,
                    student: n.student_name 
                }))
            });

            console.log('⏰ Callbacks:', {
                total: callbacksAll.length,
                unread: callbacksCount,
                unreadCalculated: callbacksAll.filter(n => !n.read).length,
                sample: callbacksAll.slice(0, 3).map(n => ({ 
                    id: n.notification_id, 
                    read: n.read,
                    count: n.count 
                }))
            });

            console.log('=== END DEBUG ===');

            return {
                whatsapp: { total: whatsappAll.length, unread: whatsappCount },
                leads: { total: leadsAll.length, unread: leadsCount },
                callbacks: { total: callbacksAll.length, unread: callbacksCount }
            };
        } catch (error) {
            console.error('Error in debugUnreadCounts:', error);
            return null;
        }
    }

    async getStats() {
        try {
            const [whatsappCount, leadsCount, callbacksCount] = await Promise.all([
                this.whatsapp.count(),
                this.leads.count(),
                this.callbacks.count()
            ]);

            const [whatsappUnread, leadsUnread, callbacksUnread] = await Promise.all([
                this.getUnreadCount('whatsapp'),
                this.getUnreadCount('leads'),
                this.getUnreadCount('callbacks')
            ]);

            return {
                whatsapp: { total: whatsappCount, unread: whatsappUnread },
                leads: { total: leadsCount, unread: leadsUnread },
                callbacks: { total: callbacksCount, unread: callbacksUnread },
                total: whatsappCount + leadsCount + callbacksCount,
                totalUnread: whatsappUnread + leadsUnread + callbacksUnread
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return null;
        }
    }

    async init() {
        try {
            console.log('🔄 Initializing NotificationDB...');
            
            try {
                await this.open();
                console.log('✅ NotificationDB opened successfully');
            } catch (openError) {
                console.error('❌ Error opening database:', openError);
                
                if (openError.name === 'ConstraintError' || 
                    openError.name === 'DatabaseClosedError' ||
                    openError.message.includes('index with the specified name already exists')) {
                    
                    console.log('🔄 Attempting to delete and recreate database...');
                    await this.delete();
                    await this.open();
                    console.log('✅ Database recreated successfully');
                } else {
                    throw openError;
                }
            }

            await Promise.all([
                this.cleanupTable('whatsapp'),
                this.cleanupTable('leads'),
                this.cleanupTable('callbacks'),
                this.cleanupTable('processed')
            ]);

            await this.debugUnreadCounts();

            console.log('🎉 NotificationDB initialization complete');

        } catch (error) {
            console.error('❌ Critical error initializing NotificationDB:', error);
            
            try {
                console.log('🔄 Creating fresh database as last resort...');
                const dbName = this.name;
                this.name = `${dbName}_fresh_${Date.now()}`;
                await this.delete();
                await this.open();
                console.log('✅ Fresh database created');
            } catch (finalError) {
                console.error('❌ Failed to create fresh database:', finalError);
            }
        }
    }
}

const notificationDB = new NotificationDB();

notificationDB.init().catch(error => {
    console.error('❌ Failed to initialize NotificationDB:', error);
});

export default notificationDB;