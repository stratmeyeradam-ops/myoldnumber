// src/views/board.js — Grade-A community message board view with tier gating ($10/$20 posting access)
export function renderBoardIndex({ categories = [], threads = [], user = null }) {
  const canPost = user && (user.tier === 't10' || user.tier === 't20');

  return `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; border-bottom: 1px solid var(--card-border); padding-bottom: 24px;">
      <div>
        <div style="font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-bottom: 4px;">Community Forum</div>
        <h1 style="font-size: 34px; font-weight: 800; color: #fff; letter-spacing: -0.02em;">Telecom &amp; Number Recovery Board</h1>
        <p style="color: var(--muted); font-size: 15px; margin-top: 4px;">
          Public discussions on carrier aging windows, pooling updates, and strategies for re-acquiring old lines.
        </p>
      </div>
      <div>
        ${canPost ? `
          <a href="/board/new" class="btn">+ Start New Thread</a>
        ` : `
          <a href="/pricing" class="btn btn-secondary" style="font-size: 13px;">
            ${user ? 'Upgrade to Post ($10/mo)' : 'Sign In to Post'}
          </a>
        `}
      </div>
    </div>

    <!-- Tier Access Notice -->
    <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid #1e293b; border-radius: 8px; padding: 12px 18px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; font-size: 13px;">
      <div style="color: var(--muted);">
        <strong style="color: #fff;">Access Rules:</strong> Reading is open to everyone. Posting &amp; replying is unlocked for Member ($10/mo) and Pro ($20/mo) tiers.
      </div>
      ${!canPost ? `<a href="/pricing" style="font-weight: 600;">Upgrade Account &rarr;</a>` : `<span style="color: #10b981; font-weight: 600;">&check; Posting Enabled</span>`}
    </div>

    <!-- Category Tabs -->
    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px;">
      <a href="/board" class="btn" style="padding: 6px 14px; font-size: 13px;">All Discussions</a>
      ${categories.map(c => `
        <a href="/board?category=${encodeURIComponent(c.slug)}" class="btn btn-secondary" style="padding: 6px 14px; font-size: 13px;">
          ${escapeHtml(c.title)}
        </a>
      `).join('')}
    </div>

    <!-- Thread List -->
    <div class="card" style="padding: 0; overflow: hidden;">
      ${threads.length === 0 ? `
        <div style="padding: 48px 24px; text-align: center; color: var(--muted);">
          No discussions yet in this category. Be the first to start a thread!
        </div>
      ` : `
        <div style="display: flex; flex-direction: column;">
          ${threads.map((t, idx) => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: ${idx === threads.length - 1 ? 'none' : '1px solid var(--card-border)'}; background: ${idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'};">
              <div style="flex: 1; min-width: 280px; padding-right: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span style="font-size: 11px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 2px 8px; border-radius: 4px;">${escapeHtml(t.category_title)}</span>
                  ${t.pinned ? `<span style="font-size: 11px; font-weight: 700; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 2px 8px; border-radius: 4px;">PINNED</span>` : ''}
                </div>
                <a href="/board/thread/${t.id}/${encodeURIComponent(t.slug)}" style="font-size: 16px; font-weight: 600; color: #fff;">
                  ${escapeHtml(t.title)}
                </a>
                <div style="font-size: 12.5px; color: var(--muted); margin-top: 4px;">
                  Started by <strong style="color: #cbd5e1;">${escapeHtml(t.author_name)}</strong> &middot; ${new Date(t.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style="text-align: right; min-width: 80px;">
                <div style="font-size: 16px; font-weight: 700; color: #fff; font-family: var(--mono);">${t.reply_count || 0}</div>
                <div style="font-size: 11px; color: var(--faint);">replies</div>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    </div>
  `;
}

export function renderThreadView({ thread, posts = [], user = null, error = null }) {
  const canPost = user && (user.tier === 't10' || user.tier === 't20');

  return `
    <div style="margin-bottom: 24px;">
      <a href="/board" style="font-size: 13px; color: var(--muted); display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px;">
        &larr; Back to all discussions
      </a>
      <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 12px; font-weight: 700; color: #38bdf8; background: rgba(56, 189, 248, 0.1); padding: 3px 8px; border-radius: 4px;">
          ${escapeHtml(thread.category_title)}
        </span>
      </div>
      <h1 style="font-size: 32px; font-weight: 800; color: #fff; line-height: 1.25;">
        ${escapeHtml(thread.title)}
      </h1>
      <div style="font-size: 13px; color: var(--muted); margin-top: 6px;">
        Posted by <strong style="color: #fff;">${escapeHtml(thread.author_name)}</strong> on ${new Date(thread.created_at).toLocaleString()}
      </div>
    </div>

    <!-- Posts Stream -->
    <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 40px;">
      ${posts.map((p, idx) => `
        <div class="card" style="padding: 20px 24px; border-left: ${idx === 0 ? '3px solid #38bdf8' : '1px solid var(--card-border)'};">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 12.5px; color: var(--muted);">
            <div><strong style="color: #fff; font-size: 14px;">${escapeHtml(p.author_name)}</strong> <span style="font-size: 11px; color: var(--faint);">&bull; ${p.author_tier ? p.author_tier.toUpperCase() : 'MEMBER'}</span></div>
            <div>${new Date(p.created_at).toLocaleString()}</div>
          </div>
          <div style="color: #e2e8f0; font-size: 14.5px; line-height: 1.6; white-space: pre-wrap;">
            ${escapeHtml(p.body)}
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Reply Box -->
    <div class="card" style="border-top: 2px solid #2563eb;">
      <h3 style="font-size: 18px; color: #fff; margin-bottom: 12px;">Reply to this discussion</h3>
      ${error ? `<div style="color: #f87171; font-size: 13px; margin-bottom: 12px;">&bull; ${escapeHtml(error)}</div>` : ''}

      ${canPost ? `
        <form action="/board/reply" method="POST">
          <input type="hidden" name="thread_id" value="${thread.id}">
          <textarea 
            name="body" 
            rows="5" 
            placeholder="Share your experience, question, or advice..." 
            required 
            style="width: 100%; background: #090c12; border: 1px solid #2d3748; border-radius: 8px; padding: 14px; font-size: 14px; color: #fff; outline: none; margin-bottom: 16px; resize: vertical;"
          ></textarea>
          <button type="submit" class="btn">Post Reply</button>
        </form>
      ` : `
        <div style="background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 8px; padding: 20px; text-align: center;">
          <p style="color: var(--muted); font-size: 14px; margin-bottom: 14px;">
            ${user ? 'Your current tier has read-only access. Upgrade to Member ($10/mo) or Pro ($20/mo) to post and reply.' : 'Please sign in to participate in the conversation.'}
          </p>
          <a href="/pricing" class="btn">${user ? 'Upgrade to Post ($10/mo)' : 'Sign In / View Plans'}</a>
        </div>
      `}
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
