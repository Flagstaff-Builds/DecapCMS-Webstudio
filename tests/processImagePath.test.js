const { processImagePath } = require('../build-posts');

describe('processImagePath', () => {
  test('converts relative paths to absolute URLs', () => {
    const result = processImagePath('images/pic.jpg');
    expect(result).toBe('https://decapcms-webstudio.netlify.app/images/pic.jpg');
  });

  test('leaves absolute URLs unchanged', () => {
    const url = 'https://example.com/img.jpg';
    expect(processImagePath(url)).toBe(url);
  });
});
