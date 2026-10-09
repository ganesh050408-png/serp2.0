import dotenv from 'dotenv';
dotenv.config();

async function testSearch() {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.log('No SERPAPI_KEY found');
    return;
  }

  const url = `https://serpapi.com/search.json?engine=google&q=best+family+travel+destinations+in+india+attractions+budget&api_key=${apiKey}&num=5`;
  console.log('Testing SerpApi Google Search...');
  try {
    const res = await fetch(url);
    const data: any = await res.json();
    console.log('Search status:', res.status);
    if (data.organic_results) {
      console.log('Found organic results:', data.organic_results.length);
      data.organic_results.slice(0, 3).forEach((r: any, i: number) => {
        console.log(`\n[${i + 1}] ${r.title}`);
        console.log(`URL: ${r.link}`);
        console.log(`Snippet: ${r.snippet}`);
      });
    } else {
      console.log('No organic results. Keys:', Object.keys(data));
    }
  } catch (err) {
    console.error('Search error:', err);
  }
}

testSearch();

