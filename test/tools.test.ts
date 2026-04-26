import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpdstarClient } from '../src/client.js';
import { runLookupRejectionCode } from '../src/tools/lookupRejectionCode.js';
import { runGetProceduresForIcd } from '../src/tools/getProceduresForIcd.js';
import { runGetIndicator } from '../src/tools/getIndicator.js';
import { runSearchNhiWiki } from '../src/tools/searchNhiWiki.js';
import { runGetDrugRules } from '../src/tools/getDrugRules.js';
import { runGetSafePhrases } from '../src/tools/getSafePhrases.js';
import { runSearchAuditGuidelines } from '../src/tools/searchAuditGuidelines.js';
import { runGetRejectionCodeCategory } from '../src/tools/getRejectionCodeCategory.js';
import { runLookupDrug } from '../src/tools/lookupDrug.js';
import { runLookupFeeCode } from '../src/tools/lookupFeeCode.js';

/**
 * Offline tool tests — mocks global fetch, asserts:
 *   1. Correct URL / method / body is sent to opdstar.com
 *   2. Response is parsed as-is (proxy is trusted to shape correctly)
 *   3. User-Agent header carries @opdstar/nhi-mcp/<ver> (brand visibility)
 */

let fetchSpy: ReturnType<typeof vi.spyOn>;

function mockFetch(response: unknown, opts: { status?: number } = {}): void {
  const { status = 200 } = opts;
  fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(response),
  } as Response);
}

beforeEach(() => {
  delete process.env.OPDSTAR_API_BASE;
});

afterEach(() => {
  fetchSpy?.mockRestore();
});

describe('lookup_rejection_code', () => {
  it('builds GET url with code param', async () => {
    mockFetch({
      code: '0317A',
      description: '抗生素使用不當',
      severity: 'critical',
      powered_by: 'OPDSTAR (https://opdstar.com)',
    });
    const client = new OpdstarClient();
    const result = await runLookupRejectionCode(client, { code: '0317A' });

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe('https://opdstar.com/api/mcp/lookup-rejection-code?code=0317A');
    expect(init?.method).toBe('GET');
    expect((init?.headers as Record<string, string>)['User-Agent']).toMatch(
      /^@opdstar\/nhi-mcp\/\d+\.\d+\.\d+/
    );
    expect(result.code).toBe('0317A');
  });

  it('uppercases and trims the input code', async () => {
    mockFetch({ code: '0317A', description: '', severity: 'warning' });
    const client = new OpdstarClient();
    await runLookupRejectionCode(client, { code: '  0317a  ' });
    expect(String(fetchSpy.mock.calls[0][0])).toBe(
      'https://opdstar.com/api/mcp/lookup-rejection-code?code=0317A'
    );
  });

  it('throws on missing code', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runLookupRejectionCode(client, {})).rejects.toThrow(/code/);
  });
});

describe('get_procedures_for_icd', () => {
  it('passes icd10 + specialty + limit', async () => {
    mockFetch({ icd10: 'L30.9', specialty: 'dermatology', count: 0, results: [] });
    const client = new OpdstarClient();
    await runGetProceduresForIcd(client, {
      icd10: 'L30.9',
      specialty: 'DERMATOLOGY',
      limit: 5,
    });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('icd10=L30.9');
    expect(url).toContain('specialty=dermatology');
    expect(url).toContain('limit=5');
  });
});

describe('get_indicator', () => {
  it('trims the code', async () => {
    mockFetch({ code: '008', name: '上呼吸道感染' });
    const client = new OpdstarClient();
    await runGetIndicator(client, { code: '  008  ' });
    expect(String(fetchSpy.mock.calls[0][0])).toBe(
      'https://opdstar.com/api/mcp/indicator?code=008'
    );
  });
});

describe('search_nhi_wiki', () => {
  it('POSTs JSON body with query + category + limit', async () => {
    mockFetch({ query: 'test', category: 'drugs', count: 0, results: [] });
    const client = new OpdstarClient();
    await runSearchNhiWiki(client, {
      query: '慢性病連續處方箋',
      category: 'drugs',
      limit: 3,
    });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe('https://opdstar.com/api/mcp/search-wiki');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      query: '慢性病連續處方箋',
      category: 'drugs',
      limit: 3,
    });
  });
});

describe('get_drug_rules (v0.2)', () => {
  it('requires at least one filter', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runGetDrugRules(client, {})).rejects.toThrow(/filter/i);
  });

  it('passes filters through', async () => {
    mockFetch({ filters: {}, count: 0, truncated: false, results: [] });
    const client = new OpdstarClient();
    await runGetDrugRules(client, {
      specialty: 'pediatrics',
      rejection_code: '0311A',
      drug_category_query: 'antibiotic',
    });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('specialty=pediatrics');
    expect(url).toContain('rejection_code=0311A');
    expect(url).toContain('drug_category_query=antibiotic');
  });
});

describe('get_safe_phrases (v0.2)', () => {
  it('requires specialty', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runGetSafePhrases(client, {})).rejects.toThrow(/specialty/);
  });

  it('lowercases specialty + passes scenario_query', async () => {
    mockFetch({ specialty: 'dermatology', count: 0, truncated: false, note: '', results: [] });
    const client = new OpdstarClient();
    await runGetSafePhrases(client, { specialty: 'DERMATOLOGY', scenario_query: '抗生素' });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('specialty=dermatology');
    expect(url).toContain('scenario_query=');
  });
});

describe('search_audit_guidelines (v0.2)', () => {
  it('rejects too-short query', async () => {
    const client = new OpdstarClient();
    await expect(runSearchAuditGuidelines(client, { query: 'a' })).rejects.toThrow(/2\+/);
  });

  it('GETs /search-audit-guidelines with query + specialty', async () => {
    mockFetch({ query: '抗生素', specialty: 'tcm', count: 0, truncated: false, note: '', results: [] });
    const client = new OpdstarClient();
    await runSearchAuditGuidelines(client, { query: '抗生素', specialty: 'TCM' });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('/search-audit-guidelines?');
    expect(url).toContain('specialty=tcm');
    expect(url).toContain('query=');
  });
});

describe('get_rejection_code_category (v0.2)', () => {
  it('requires category', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runGetRejectionCodeCategory(client, {})).rejects.toThrow(/category/);
  });

  it('passes opdstar_relevant_only flag when true', async () => {
    mockFetch({ category: '03', count: 0, truncated: false, opdstar_relevant_only: true, results: [] });
    const client = new OpdstarClient();
    await runGetRejectionCodeCategory(client, { category: '03', opdstar_relevant_only: true });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('category=03');
    expect(url).toContain('opdstar_relevant_only=true');
  });

  it('omits opdstar_relevant_only when false/undefined', async () => {
    mockFetch({ category: '03', count: 0, truncated: false, opdstar_relevant_only: false, results: [] });
    const client = new OpdstarClient();
    await runGetRejectionCodeCategory(client, { category: '03' });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).not.toContain('opdstar_relevant_only');
  });
});

describe('lookup_drug (v0.3)', () => {
  it('requires q ≥2 chars', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runLookupDrug(client, {})).rejects.toThrow(/q/);
    await expect(runLookupDrug(client, { q: 'a' })).rejects.toThrow(/2/);
  });

  it('builds GET url with q + filters', async () => {
    mockFetch({ query: 'augmentin', filters: {}, count: 0, results: [] });
    const client = new OpdstarClient();
    await runLookupDrug(client, {
      q: 'augmentin',
      specialty: 'INTERNAL',
      dosage_form: 'TABLET',
      route: 'ORAL',
    });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('q=augmentin');
    expect(url).toContain('specialty=internal');
    expect(url).toContain('dosage_form=tablet');
    expect(url).toContain('route=oral');
  });

  it('omits empty filters', async () => {
    mockFetch({ query: 'A02229715', filters: {}, count: 0, results: [] });
    const client = new OpdstarClient();
    await runLookupDrug(client, { q: 'A02229715' });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('q=A02229715');
    expect(url).not.toContain('specialty=');
    expect(url).not.toContain('dosage_form=');
  });
});

describe('lookup_fee_code (v0.4)', () => {
  it('requires q ≥2 chars', async () => {
    const client = new OpdstarClient();
    // @ts-expect-error intentional bad input
    await expect(runLookupFeeCode(client, {})).rejects.toThrow(/q/);
    await expect(runLookupFeeCode(client, { q: 'a' })).rejects.toThrow(/2/);
  });

  it('builds GET url with q + filters (uppercased)', async () => {
    mockFetch({ query: '00101B', filters: {}, count: 0, results: [] });
    const client = new OpdstarClient();
    await runLookupFeeCode(client, {
      q: '00101B',
      category: '00',
      icd: 'l70.0',
    });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('q=00101B');
    expect(url).toContain('category=00');
    expect(url).toContain('icd=L70.0'); // uppercased
  });

  it('omits empty filters', async () => {
    mockFetch({ query: '門診診察', filters: {}, count: 0, results: [] });
    const client = new OpdstarClient();
    await runLookupFeeCode(client, { q: '門診診察' });
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('q=');
    expect(url).not.toContain('category=');
    expect(url).not.toContain('icd=');
  });
});

describe('OpdstarClient — env override', () => {
  it('respects OPDSTAR_API_BASE for staging', async () => {
    mockFetch({ code: '0317A', description: '', severity: 'warning' });
    process.env.OPDSTAR_API_BASE = 'https://staging.opdstar.com/api/mcp';
    const client = new OpdstarClient();
    await runLookupRejectionCode(client, { code: '0317A' });
    expect(String(fetchSpy.mock.calls[0][0])).toBe(
      'https://staging.opdstar.com/api/mcp/lookup-rejection-code?code=0317A'
    );
  });

  it('surfaces proxy errors with prefix', async () => {
    mockFetch({ error: 'Invalid code format' }, { status: 400 });
    const client = new OpdstarClient();
    await expect(runLookupRejectionCode(client, { code: '0317A' })).rejects.toThrow(
      /OPDSTAR API error: Invalid code format/
    );
  });
});
