import fs from 'fs';
import path from 'path';

export interface LocalDbSchema {
  contacts: any[];
  campaigns: any[];
  messages: any[];
  inbound_messages: any[];
  whatsapp_templates: any[];
  email_templates: any[];
  media_assets: any[];
  telegram_posts: any[];
  settings: any[];
  system_alerts: any[];
}

const DB_FILE_PATH = path.join(process.cwd(), '.local-db.json');

const INITIAL_SEED: LocalDbSchema = {
  contacts: [
    {
      id: 'c-101',
      name: 'Aarav Sharma',
      phone: '+919876543210',
      email: 'aarav.sharma@example.com',
      telegram_chat_id: '987654321',
      tags: ['VIP', 'Customer'],
      tier: 'vip',
      parties_attended: 4,
      total_spend_inr: 8500,
      last_attended_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      whatsapp_opt_in: true,
      email_opt_in: true,
      unsubscribed: false,
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'c-102',
      name: 'Priya Patel',
      phone: '+919823456789',
      email: 'priya.patel@example.com',
      telegram_chat_id: '876543210',
      tags: ['Beta', 'Customer', 'Regular'],
      tier: 'regular',
      parties_attended: 2,
      total_spend_inr: 2200,
      last_attended_at: new Date(Date.now() - 12 * 86400000).toISOString(),
      whatsapp_opt_in: true,
      email_opt_in: true,
      unsubscribed: false,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'c-103',
      name: 'Rohan Mehta',
      phone: '+919123456780',
      email: 'rohan.mehta@example.com',
      telegram_chat_id: '',
      tags: ['Lead'],
      tier: 'lead',
      parties_attended: 0,
      total_spend_inr: 0,
      last_attended_at: null,
      whatsapp_opt_in: true,
      email_opt_in: false,
      unsubscribed: false,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'c-104',
      name: 'Ananya Gupta',
      phone: '+919988776655',
      email: 'ananya.gupta@example.com',
      telegram_chat_id: '765432109',
      tags: ['VIP', 'Investor'],
      tier: 'vip',
      parties_attended: 5,
      total_spend_inr: 15000,
      last_attended_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      whatsapp_opt_in: true,
      email_opt_in: true,
      unsubscribed: false,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'c-105',
      name: 'Vikram Singh',
      phone: '+919345678901',
      email: 'vikram.singh@example.com',
      telegram_chat_id: '',
      tags: ['Customer', 'Regular'],
      tier: 'regular',
      parties_attended: 1,
      total_spend_inr: 1000,
      last_attended_at: new Date(Date.now() - 18 * 86400000).toISOString(),
      whatsapp_opt_in: false,
      email_opt_in: true,
      unsubscribed: false,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'c-106',
      name: 'Sneha Rao',
      phone: '+919811223344',
      email: 'sneha.rao@example.com',
      telegram_chat_id: '654321098',
      tags: ['Beta', 'Lead'],
      tier: 'lead',
      parties_attended: 0,
      total_spend_inr: 0,
      last_attended_at: null,
      whatsapp_opt_in: true,
      email_opt_in: true,
      unsubscribed: false,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ],
  campaigns: [
    {
      id: 'camp-1',
      name: 'Festive Season Launch Broadcast',
      channels: ['whatsapp', 'telegram', 'email'],
      status: 'completed',
      scheduled_for: new Date(Date.now() - 7 * 86400000).toISOString(),
      audience_filter: { tags: ['VIP', 'Customer'], optInOnly: true },
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    },
    {
      id: 'camp-2',
      name: 'Product 2.0 Feature Announcement',
      channels: ['whatsapp', 'email'],
      status: 'completed',
      scheduled_for: new Date(Date.now() - 3 * 86400000).toISOString(),
      audience_filter: { tags: [], optInOnly: true },
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'camp-3',
      name: 'Weekend Special Notification',
      channels: ['whatsapp'],
      status: 'draft',
      scheduled_for: null,
      audience_filter: { tags: ['Lead'], optInOnly: true },
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  messages: [
    {
      id: 'msg-1',
      campaign_id: 'camp-1',
      contact_id: 'c-101',
      channel: 'whatsapp',
      status: 'read',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 1000).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 2500).toISOString(),
    },
    {
      id: 'msg-2',
      campaign_id: 'camp-1',
      contact_id: 'c-102',
      channel: 'whatsapp',
      status: 'delivered',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 1200).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 3000).toISOString(),
    },
    {
      id: 'msg-3',
      campaign_id: 'camp-1',
      contact_id: 'c-104',
      channel: 'whatsapp',
      status: 'delivered',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 1400).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 3200).toISOString(),
    },
    {
      id: 'msg-4',
      campaign_id: 'camp-1',
      contact_id: 'c-101',
      channel: 'email',
      status: 'delivered',
      cost_inr: 0.0,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 500).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 1200).toISOString(),
    },
    {
      id: 'msg-5',
      campaign_id: 'camp-1',
      contact_id: 'c-102',
      channel: 'email',
      status: 'delivered',
      cost_inr: 0.0,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 600).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 1300).toISOString(),
    },
    {
      id: 'msg-6',
      campaign_id: 'camp-1',
      contact_id: 'c-101',
      channel: 'telegram',
      status: 'delivered',
      cost_inr: 0.0,
      queued_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 7 * 86400000 + 200).toISOString(),
      delivered_at: new Date(Date.now() - 7 * 86400000 + 400).toISOString(),
    },
    {
      id: 'msg-7',
      campaign_id: 'camp-2',
      contact_id: 'c-101',
      channel: 'whatsapp',
      status: 'read',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 1000).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 2100).toISOString(),
    },
    {
      id: 'msg-8',
      campaign_id: 'camp-2',
      contact_id: 'c-102',
      channel: 'whatsapp',
      status: 'delivered',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 1100).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 2200).toISOString(),
    },
    {
      id: 'msg-9',
      campaign_id: 'camp-2',
      contact_id: 'c-103',
      channel: 'whatsapp',
      status: 'delivered',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 1200).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 2300).toISOString(),
    },
    {
      id: 'msg-10',
      campaign_id: 'camp-2',
      contact_id: 'c-104',
      channel: 'whatsapp',
      status: 'delivered',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 1300).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 2400).toISOString(),
    },
    {
      id: 'msg-11',
      campaign_id: 'camp-2',
      contact_id: 'c-106',
      channel: 'whatsapp',
      status: 'read',
      cost_inr: 0.82,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 1500).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 2600).toISOString(),
    },
    {
      id: 'msg-12',
      campaign_id: 'camp-2',
      contact_id: 'c-101',
      channel: 'email',
      status: 'delivered',
      cost_inr: 0.0,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 500).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 1100).toISOString(),
    },
    {
      id: 'msg-13',
      campaign_id: 'camp-2',
      contact_id: 'c-105',
      channel: 'email',
      status: 'delivered',
      cost_inr: 0.0,
      queued_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      sent_at: new Date(Date.now() - 3 * 86400000 + 700).toISOString(),
      delivered_at: new Date(Date.now() - 3 * 86400000 + 1400).toISOString(),
    },
  ],
  inbound_messages: [
    {
      id: 'in-1',
      channel: 'whatsapp',
      sender_phone: '+919876543210',
      sender_name: 'Aarav Sharma',
      body: 'Can I get more details on the enterprise pricing tier?',
      received_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'in-2',
      channel: 'whatsapp',
      sender_phone: '+919823456789',
      sender_name: 'Priya Patel',
      body: 'Thank you for the update! Very excited for the new feature release.',
      received_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ],
  whatsapp_templates: [
    {
      id: 'tpl-1',
      name: 'campaign_broadcast_v1',
      category: 'MARKETING',
      language: 'en_US',
      status: 'APPROVED',
      header: 'Exciting Update from CampaignHub',
      body: 'Hello {{1}}, we have special announcements regarding your account. Check out our latest features!',
      footer: 'Reply STOP to opt out',
      meta_template_id: 'meta_tpl_9876543210',
    },
    {
      id: 'tpl-2',
      name: 'order_status_update',
      category: 'UTILITY',
      language: 'en_US',
      status: 'APPROVED',
      header: 'Delivery Notification',
      body: 'Dear {{1}}, your request #{{2}} is now confirmed and being processed.',
      footer: 'CampaignHub Automated Alerts',
      meta_template_id: 'meta_tpl_1234567890',
    },
  ],
  email_templates: [
    {
      id: 'etpl-1',
      name: 'Welcome Onboarding',
      subject: 'Welcome to CampaignHub, {{first_name}}!',
      body_html: '<h1>Welcome {{first_name}}!</h1><p>We are thrilled to have you on board. Here is everything you need to get started.</p>',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 'etpl-2',
      name: 'Product Newsletter',
      subject: 'CampaignHub Monthly Digest — Product Updates',
      body_html: '<h2>What is new this month</h2><p>Read about our multi-channel delivery engine and analytics enhancements.</p>',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  ],
  media_assets: [
    {
      id: 'media-1',
      name: 'CampaignHub Hero Banner',
      url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
      channel: 'All Channels',
      file_size_bytes: 245000,
      mime_type: 'image/jpeg',
      created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: 'media-2',
      name: 'Festive Season Promo Visual',
      url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
      channel: 'WhatsApp',
      file_size_bytes: 180000,
      mime_type: 'image/jpeg',
      created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
  ],
  telegram_posts: [
    {
      id: 'tg-1',
      channel_name: '@campaignhub_internal',
      message_text: '🚀 CampaignHub 2.0 is live! Broadcasts to WhatsApp, Telegram, and Email are fully operational with 24/7 worker monitoring.',
      media_url: '',
      sent_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      post_id: '1042',
    },
  ],
  settings: [],
  system_alerts: [],
};

let inMemoryDb: LocalDbSchema | null = null;

export function getLocalDb(): LocalDbSchema {
  if (inMemoryDb) return inMemoryDb;
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      inMemoryDb = JSON.parse(data);
      return inMemoryDb!;
    }
  } catch (err) {
    console.warn('Failed reading local db file, using seed:', err);
  }

  inMemoryDb = JSON.parse(JSON.stringify(INITIAL_SEED));
  saveLocalDb(inMemoryDb!);
  return inMemoryDb!;
}

export function saveLocalDb(db: LocalDbSchema) {
  inMemoryDb = db;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed writing local db file:', err);
  }
}

export class LocalQueryBuilder {
  private tableName: keyof LocalDbSchema;
  private filters: Array<(item: any) => boolean> = [];
  private orderColumn?: string;
  private orderAscending = true;
  private rangeFrom?: number;
  private rangeTo?: number;
  private limitCount?: number;
  private selectedColumns = '*';
  private isHeadOnly = false;
  private isSingle = false;

  constructor(table: string) {
    this.tableName = table as keyof LocalDbSchema;
  }

  select(columns = '*', options?: { count?: string; head?: boolean }) {
    this.selectedColumns = columns;
    if (options?.head) {
      this.isHeadOnly = true;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => item[column] === value);
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push((item) => item[column] !== value);
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push((item) => item[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push((item) => item[column] <= value);
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push((item) => values.includes(item[column]));
    return this;
  }

  is(column: string, value: any) {
    this.filters.push((item) => {
      if (value === null) return item[column] === null || item[column] === undefined;
      return item[column] === value;
    });
    return this;
  }

  not(column: string, operator: string, value: any) {
    this.filters.push((item) => {
      if (operator === 'is' && value === null) {
        return item[column] !== null && item[column] !== undefined;
      }
      if (operator === 'eq') return item[column] !== value;
      return true;
    });
    return this;
  }

  contains(column: string, value: any[]) {

    this.filters.push((item) => {
      const fieldVal = item[column];
      if (Array.isArray(fieldVal) && Array.isArray(value)) {
        return value.every((v) => fieldVal.includes(v));
      }
      return false;
    });
    return this;
  }

  or(filterString: string) {
    const conditions = filterString.split(',').map((c) => c.trim());
    this.filters.push((item) => {
      return conditions.some((cond) => {
        const parts = cond.split('.ilike.');
        if (parts.length === 2) {
          const [col, pattern] = parts;
          const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
          const val = String(item[col] || '').toLowerCase();
          return val.includes(cleanPattern);
        }
        return false;
      });
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async then(resolve: (val: any) => void, reject?: (err: any) => void) {
    try {
      const db = getLocalDb();
      let table = (db[this.tableName] || []) as any[];

      for (const filter of this.filters) {
        table = table.filter(filter);
      }

      const totalCount = table.length;

      if (this.orderColumn) {
        const col = this.orderColumn;
        const asc = this.orderAscending;
        table.sort((a, b) => {
          if (a[col] < b[col]) return asc ? -1 : 1;
          if (a[col] > b[col]) return asc ? 1 : -1;
          return 0;
        });
      }

      if (this.rangeFrom !== undefined && this.rangeTo !== undefined) {
        table = table.slice(this.rangeFrom, this.rangeTo + 1);
      } else if (this.limitCount !== undefined) {
        table = table.slice(0, this.limitCount);
      }

      if (this.tableName === 'messages' && this.selectedColumns.includes('contacts')) {
        table = table.map((m) => {
          const contact = (db.contacts || []).find((c: any) => c.id === m.contact_id);
          return {
            ...m,
            contacts: contact ? { id: contact.id, name: contact.name, phone: contact.phone, email: contact.email, tier: contact.tier } : null,
          };
        });
      }

      if (this.isHeadOnly) {
        resolve({ data: null, count: totalCount, error: null });
        return;
      }

      if (this.isSingle) {
        resolve({ data: table[0] || null, count: totalCount, error: null });
        return;
      }

      resolve({ data: table, count: totalCount, error: null });
    } catch (err: any) {
      if (reject) reject(err);
      else resolve({ data: null, count: 0, error: err });
    }
  }

  insert(items: any | any[]) {
    const db = getLocalDb();
    if (!db[this.tableName]) db[this.tableName] = [];

    const toInsert = Array.isArray(items) ? items : [items];
    const created: any[] = [];

    for (const item of toInsert) {
      const record = {
        id: item.id || `id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        created_at: item.created_at || new Date().toISOString(),
        ...item,
      };
      db[this.tableName].push(record);
      created.push(record);
    }

    saveLocalDb(db);
    const resultData = Array.isArray(items) ? created : created[0];

    const resultObj: any = {
      data: resultData,
      error: null,
      select: () => resultObj,
      single: () => {
        resultObj.data = Array.isArray(resultData) ? resultData[0] : resultData;
        return resultObj;
      },
      then: (resolve: (val: any) => void) => resolve({ data: resultObj.data, error: null }),
    };
    return resultObj;
  }

  upsert(items: any | any[], options?: { onConflict?: string }) {
    const db = getLocalDb();
    if (!db[this.tableName]) db[this.tableName] = [];

    const toUpsert = Array.isArray(items) ? items : [items];
    const result: any[] = [];

    for (const item of toUpsert) {
      const matchIndex = db[this.tableName].findIndex((existing) => {
        if (item.id && existing.id === item.id) return true;
        if (item.key && existing.key === item.key) return true;
        if (item.name && existing.name === item.name) return true;
        return false;
      });

      if (matchIndex >= 0) {
        db[this.tableName][matchIndex] = {
          ...db[this.tableName][matchIndex],
          ...item,
          updated_at: new Date().toISOString(),
        };
        result.push(db[this.tableName][matchIndex]);
      } else {
        const record = {
          id: item.id || `id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          created_at: item.created_at || new Date().toISOString(),
          ...item,
        };
        db[this.tableName].push(record);
        result.push(record);
      }
    }

    saveLocalDb(db);
    const resultData = Array.isArray(items) ? result : result[0];

    const resultObj: any = {
      data: resultData,
      error: null,
      select: () => resultObj,
      single: () => {
        resultObj.data = Array.isArray(resultData) ? resultData[0] : resultData;
        return resultObj;
      },
      then: (resolve: (val: any) => void) => resolve({ data: resultObj.data, error: null }),
    };
    return resultObj;
  }

  update(updates: any) {
    const self = this;
    const resultObj: any = {
      eq(col: string, val: any) {
        self.eq(col, val);
        return resultObj;
      },
      select: () => resultObj,
      single: () => resultObj,
      async execute() {
        const db = getLocalDb();
        const table = (db[self.tableName] || []) as any[];
        let updatedItem: any = null;
        for (let i = 0; i < table.length; i++) {
          let matches = true;
          for (const filter of self.filters) {
            if (!filter(table[i])) {
              matches = false;
              break;
            }
          }
          if (matches) {
            table[i] = {
              ...table[i],
              ...updates,
              updated_at: new Date().toISOString(),
            };
            updatedItem = table[i];
          }
        }
        saveLocalDb(db);
        return { data: updatedItem, error: null };
      },
      then(resolve: (val: any) => void) {
        return resultObj.execute().then(resolve);
      },
    };
    return resultObj;
  }

  delete() {
    const self = this;
    return {
      eq(col: string, val: any) {
        self.eq(col, val);
        return this.execute();
      },
      in(col: string, vals: any[]) {
        self.in(col, vals);
        return this.execute();
      },
      async execute() {
        const db = getLocalDb();
        const table = (db[self.tableName] || []) as any[];
        db[self.tableName] = table.filter((item) => {
          for (const filter of self.filters) {
            if (filter(item)) return false;
          }
          return true;
        });
        saveLocalDb(db);
        return { data: null, error: null };
      },
      then(resolve: (val: any) => void) {
        return this.execute().then(resolve);
      },
    };
  }
}

export function createFallbackClient(): any {
  return {
    from(table: string) {
      return new LocalQueryBuilder(table);
    },
  };
}
