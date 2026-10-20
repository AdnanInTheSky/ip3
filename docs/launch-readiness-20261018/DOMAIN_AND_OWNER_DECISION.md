# IP3 domain and conditional-launch decision — 18 October 2026

Owner authorization: GO for readiness and conditional production launch only when every required gate passes and no DNS change is required. Any unresolved route, content, protection, target, contact or rollback gate means NO-GO. The local release planner must keep its disabled upload/promotion safeguards. The previous ip3cl.com exclusion and public preparation-topic decision are superseded.

## One website, one repository, one CMS

| Host | Intended behavior | Current read-only observation |
|---|---|---|
| https://ip3-bd.org | Primary canonical site | Existing production returns 200; TLS certificate verifies |
| http://ip3-bd.org | 301 to primary HTTPS | Already observed |
| https://www.ip3-bd.org | 301 to apex primary | Already observed |
| http://www.ip3-bd.org | Reach primary HTTPS | Currently 301 to HTTPS www, then 301 to apex |
| ip3cl.com and www.ip3cl.com, HTTP/HTTPS | Proposed secondary-domain redirects to approved primary | All four roots return 200; no primary-domain redirect active |

No secondary website build, CMS or repository is needed. Do not import ip3cl.com content. Keep existing domain registrations/hosting; no new subscription or paid infrastructure is proposed. Additional spending cap is $0; account allowances and existing renewals must not be called unlimited/free.

The secondary redirect is a proposal, not executable configuration. Both root URLs should eventually use a permanent server redirect to https://ip3-bd.org/. Approve path mappings only after verifying equivalent content; unknown old paths must not all land on the homepage. Do not carry unverified ip3cl.com WordPress selectors into primary article IDs. Ordinary approved equivalent paths may preserve their path and non-conflicting query. Rehearse no loops and no external/open-redirect destination before activation.

Google recommends a permanent redirect from an alternative domain to a preferred domain: https://developers.google.com/search/help/crawling-index-faq. Canonical links and sitemap locations should consistently use the primary host: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls.

## DNS and email protection

**Proposed DNS changes: none. Applied DNS changes: none.** The current secondary host already responds with valid TLS; investigate a redirect on that existing host before considering DNS changes. The current Hostinger Business list shows five websites and no ip3cl.com website. The primary-domain Parked Domains screen reports 0/100 aliases across the plan. Hosting/account control for the secondary domain is therefore unverified; this observation does not prove the domain is unowned or unavailable elsewhere. The Hostinger origin redirect capability/account ownership for that domain is not yet verified. Do not activate a cross-domain redirect without exact approved configuration. If DNS changes become necessary, list each hostname, type, old value, new value and TTL and stop for explicit approval.

Read-only Windows DNS observation: primary apex A answers 147.79.69.250 and 93.127.173.246 (CDN edges, not a deploy-origin instruction); www CNAME www.ip3-bd.org.cdn.hstgr.net. Secondary apex A 2.57.91.91; secondary www CNAME ip3cl.com. Do not replace CDN answers with the hosting origin based on this lookup. Primary MX records mx1.hostinger.com priority 5 and mx2.hostinger.com priority 10, SPF and verification TXT records were observed. Preserve MX, SPF, DKIM, DMARC, verification, NS, CAA and unrelated records. No mail account changes are authorized. Lack of a DNS answer for the secondary domain is not proof that it has no email service.

Node direct DNS queries returned ECONNREFUSED; the Windows system resolver succeeded. Those failed attempts are retained as failed observations, not passed DNS evidence. Both primary hostnames had a verified certificate valid through 10 January 2027 UTC; both secondary hostnames had a verified certificate valid through 27 December 2026 UTC at inspection. This is a point-in-time observation.

## Article and contact policy

Four complete articles (17298, 17320, 8763 and 3355) keep their reviewed body, identity, metadata and approval digests. Twelve source-missing entries remain private drafts; their slugs/legacy IDs are retained internally, with no public HTML, card, sitemap location or legacy redirect. They remain editable through the visual Markdown body field and repository-managed PNG/WebP media with alt/caption fields. Draft status continues until complete owner-written content is reviewed and approved.

Contact stays in email-app fallback mode. Button: Prepare email. FAQ: “The form opens a draft in your email app. You must press Send in that app for your message to reach IP3. If no email app opens, write to info@ip3-bd.org.” No response time is promised. No real enquiry, provider request or private secret configuration is part of this update.

## Task board and gates

| Task / expected result | Evidence / verification gate | Status |
|---|---|---|
| Canonical host and fallback copy | Generated HTML/canonical/JSON-LD/sitemap use apex; forms disclose draft/send behavior | Local implementation; fresh candidate verification required |
| Four complete / twelve private | Source/approval digests and full preserved source checks; build excludes drafts and their aliases | Local tests required; CMS branch must receive change |
| CMS/editor workflow | Markdown and owned media fields preserved; named reviewer/access roles and hosted acceptance | Configuration available; hosted governance UAT pending |
| Production host/domain | Anonymous HEAD/TLS and read-only Hostinger target path | Fresh public HEAD/TLS observed; renewed primary File Manager confirms public_html still contains WordPress; no file opened/changed |
| Protected staging | Current candidate/hash; full routes/assets; robots policy and protection | Old candidate evidence historical; updated candidate not deployed by this document |
| Hostinger rollback | Exact protected-staging selector switch, prior/candidate marker and reverse verification | Pending; local simulation does not pass this gate |
| Production release | Every gate above passes; exact source/payload/target and tested recovery; no DNS change | Conditional owner authorization exists; currently NO-GO |
| Secondary redirect | Exact URL mapping, current hosting/DNS/TLS and owner-approved configuration | Proposal only |
| Legacy retirement | Replacement live/stable; enumerated legacy list and separately approved recovery/removal | No deletion authorized |

No WordPress, Elementor, database, email, production routing/DNS, backups, restores or legacy deletion is authorized during readiness. Existing WordPress stays in place through initial cutover; any final routing mechanism must respect that constraint. Hostinger’s documented Web-plan root-directory restriction means an untested document-root switch is not a release method: https://www.hostinger.com/support/1583494-what-is-the-path-to-your-website-s-root-home-directory-and-how-to-change-it-in-hostinger/.
