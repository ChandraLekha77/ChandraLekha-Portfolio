const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontFiles = [
  {
    name: 'GeneralSans-Regular.woff2',
    url: 'https://cdn.fontshare.com/wf/MFQT7HFGCR2L5ULQTW6YXYZXXHMPKLJ3/YWQ244D6TACUX5JBKATPOW5I5MGJ3G73/7YY3ZAAE3TRV2LANYOLXNHTPHLXVWTKH.woff2'
  },
  {
    name: 'GeneralSans-Medium.woff2',
    url: 'https://cdn.fontshare.com/wf/3RZHWSNONLLWJK3RLPEKUZOMM56GO4LJ/BPDRY7AHVI3MCDXXVXTQQ76H3UXA63S3/SB2OEB6IKZPRR6JT4GFJ2TFT6HBB6AZN.woff2'
  },
  {
    name: 'GeneralSans-Semibold.woff2',
    url: 'https://cdn.fontshare.com/wf/K46YRH762FH3QJ25IQM3VAXAKCHEXXW4/ISLWQPUZHZF33LRIOTBMFOJL57GBGQ4B/3ZLMEXZEQPLTEPMHTQDAUXP5ZZXCZAEN.woff2'
  },
  {
    name: 'GeneralSans-Bold.woff2',
    url: 'https://cdn.fontshare.com/wf/KWXO5X3YW4X7OLUMPO4X24HQJGJU7E2Q/VOWUQZS3YLP66ZHPTXAFSH6YACY4WJHT/NIQ54PVBBIWVK3PFSOIOUJSXIJ5WTNDP.woff2'
  },
  {
    name: 'Epilogue-Regular.woff2',
    url: 'https://fonts.gstatic.com/s/epilogue/v20/O4ZRFGj5hxF0EhjimlIksgg.woff2'
  },
  {
    name: 'Epilogue-Bold.woff2',
    url: 'https://fonts.gstatic.com/s/epilogue/v20/O4ZMFGj5hxF0EhjimngomvnCCtqb30OX1zTSC5_U.woff2'
  },
  {
    name: 'ClashDisplay-Semibold.woff2',
    url: 'https://cdn.fontshare.com/wf/FPDAZ2S6SW4QMSRIIKNNGTPM6VIXYMKO/5HNPQ453FRLIQWV2FNOBUU3FKTDZQVSG/Z3MGHFHX6DCTLQ55LJYRJ5MDCZPMFZU6.woff2'
  },
  {
    name: 'ClashDisplay-Bold.woff2',
    url: 'https://cdn.fontshare.com/wf/BFBSY7LX5W2U2EROCLVVTQP4VS7S4PC3/IIUX4FGTMD2LK2VWD3RVTAS4SSMUN7B5/53RZKGODFYDW3QHTIL7IPOWTBCSUEZK7.woff2'
  }
];

async function downloadAll() {
  for (const item of fontFiles) {
    const dest = path.join(fontsDir, item.name);
    console.log(`Downloading ${item.name}...`);
    const res = await fetch(item.url);
    if (!res.ok) throw new Error(`Failed to fetch ${item.url}: ${res.statusText}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`Saved ${item.name} (${buf.length} bytes)`);
  }
  console.log('All local woff2 fonts downloaded successfully!');
}

downloadAll().catch(err => {
  console.error(err);
  process.exit(1);
});
