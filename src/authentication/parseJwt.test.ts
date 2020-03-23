import parseJwt from './parseJwt';

describe('parseJwt', () => {
  it('should parse JWT', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiTG91aXNlIn0.LydxYJcsR5D5lFzF-UGiQjtqc9F58Q3kffQ3KwcEAIE';
    const result = parseJwt(token);
    expect(result).toBe('{"name":"Louise"}');
  });

  it('should parse JWT with unicode characters', () => {
    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoixYHDtMO8w61zw6gifQ.59rghrFL8QwklRS1zmGggBV5hPAbhJhgtX0tjpGBJV4';
    const result = parseJwt(token);
    expect(result).toBe('{"name":"Łôüísè"}');
  });
});
