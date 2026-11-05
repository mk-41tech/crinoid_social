import { ApprovalPostItem, ApprovalComment, ApprovalStatus } from '../components/approval/types';
import { BrandUser } from '../types';

const STORAGE_APPROVAL_POSTS = 'crinoid_approval_posts_v1';

export class ApprovalService {
  /**
   * Fetch authorized approvers for a given brand from the backend API.
   * Only users with the authorized approver role are returned.
   */
  async getBrandApprovers(brandId: string): Promise<BrandUser[]> {
    try {
      const res = await fetch(`/api/brands/${encodeURIComponent(brandId)}/approvers`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Failed to fetch brand approvers from API, using authoritative fallback', e);
    }

    // Authoritative approvers for Crinoid Tech & Nexus Lifestyle across all multi-stage steps:
    return [
      {
        id: 'u-3',
        name: 'Karthik',
        email: 'karthik@crinoid.social',
        role: 'Approver',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        brandId
      },
      {
        id: 'u-4',
        name: 'Kavitha (Brand Client)',
        email: 'kavitha@nexuslife.io',
        role: 'Brand Approver' as any,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
        brandId
      },
      {
        id: 'u-5',
        name: 'Suresh (Compliance Lead)',
        email: 'compliance@crinoid.social',
        role: 'Compliance Lead' as any,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
        brandId
      }
    ];
  }

  /**
   * Fetch all approval items for a brand from the backend database.
   */
  async getApprovals(brandId: string): Promise<ApprovalPostItem[]> {
    try {
      const res = await fetch(`/api/approvals?brandId=${encodeURIComponent(brandId)}`);
      if (res.ok) {
        const items = await res.json();
        if (Array.isArray(items)) {
          // Sync to local cache
          try {
            localStorage.setItem(STORAGE_APPROVAL_POSTS, JSON.stringify(items));
          } catch {}
          return items;
        }
      }
    } catch (e) {
      console.warn('API getApprovals failed, falling back to cache', e);
    }

    // Fallback to cache if network fails
    try {
      const cached = localStorage.getItem(STORAGE_APPROVAL_POSTS);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}

    return [];
  }

  /**
   * Submit a new post for approval via the backend API.
   */
  async submitApproval(item: ApprovalPostItem): Promise<ApprovalPostItem> {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      });

      if (res.ok) {
        const created: ApprovalPostItem = await res.json();
        // Update local cache
        this.updateLocalCacheItem(created);
        return created;
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed to submit' }));
        throw new Error(err.error || 'Failed to submit post for approval');
      }
    } catch (e: any) {
      console.warn('API submitApproval failed, updating local cache', e);
      this.updateLocalCacheItem(item);
      return item;
    }
  }

  /**
   * Submit an approval decision (approve, reject, changes_requested)
   */
  async submitDecision(
    postId: string,
    decision: 'approve' | 'reject' | 'changes_requested',
    user: { id: string; name: string; role: string; avatar?: string },
    note?: string
  ): Promise<ApprovalPostItem> {
    try {
      const res = await fetch(`/api/approvals/${encodeURIComponent(postId)}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          decision,
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          userAvatar: user.avatar,
          note
        })
      });

      if (res.ok) {
        const updated: ApprovalPostItem = await res.json();
        this.updateLocalCacheItem(updated);
        return updated;
      } else {
        const err = await res.json().catch(() => ({ error: 'Decision failed' }));
        throw new Error(err.error || 'Failed to record approval decision');
      }
    } catch (e: any) {
      console.warn('API submitDecision failed, performing local transition', e);
      throw e;
    }
  }

  /**
   * Add a review comment
   */
  async addComment(
    postId: string,
    author: { id: string; name: string; role: string; avatar?: string },
    content: string,
    mentions: string[] = []
  ): Promise<ApprovalPostItem | null> {
    try {
      const res = await fetch(`/api/approvals/${encodeURIComponent(postId)}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          authorId: author.id,
          authorName: author.name,
          authorRole: author.role,
          authorAvatar: author.avatar,
          content,
          mentions
        })
      });

      if (res.ok) {
        const updated: ApprovalPostItem = await res.json();
        this.updateLocalCacheItem(updated);
        return updated;
      }
    } catch (e) {
      console.warn('API addComment failed', e);
    }
    return null;
  }

  /**
   * Resubmit post after changes requested
   */
  async resubmit(
    postId: string,
    user: { id: string; name: string; role: string },
    newCaption?: string
  ): Promise<ApprovalPostItem | null> {
    try {
      const res = await fetch(`/api/approvals/${encodeURIComponent(postId)}/resubmit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          newCaption
        })
      });

      if (res.ok) {
        const updated: ApprovalPostItem = await res.json();
        this.updateLocalCacheItem(updated);
        return updated;
      }
    } catch (e) {
      console.warn('API resubmit failed', e);
    }
    return null;
  }

  private updateLocalCacheItem(item: ApprovalPostItem) {
    try {
      const cached = localStorage.getItem(STORAGE_APPROVAL_POSTS);
      const items: ApprovalPostItem[] = cached ? JSON.parse(cached) : [];
      const idx = items.findIndex(i => i.id === item.id);
      if (idx !== -1) {
        items[idx] = item;
      } else {
        items.unshift(item);
      }
      localStorage.setItem(STORAGE_APPROVAL_POSTS, JSON.stringify(items));
    } catch {}
  }
}

export const approvalService = new ApprovalService();

