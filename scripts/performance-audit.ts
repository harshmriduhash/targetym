import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';

async function runLighthouse(url: string) {
  const chrome = await launch({ chromeFlags: ['--headless'] });
  const runnerResult = await lighthouse(url, {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
    port: chrome.port,
  });

  const performanceScore = runnerResult.lhr.categories.performance.score * 100;
  const accessibilityScore = runnerResult.lhr.categories.accessibility.score * 100;

  console.log('Performance Score:', performanceScore);
  console.log('Accessibility Score:', accessibilityScore);

  // Optional: Write results to file
  // fs.writeFileSync('lighthouse-report.json', JSON.stringify(runnerResult.lhr, null, 2));

  await chrome.kill();
  return { performanceScore, accessibilityScore };
}

export default runLighthouse;
