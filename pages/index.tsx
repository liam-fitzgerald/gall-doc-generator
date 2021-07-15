import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Gall Documentation</title>
      </Head>
      <div>
        <Link href="/scries">Scries</Link>
      </div>
    </div>
  );
}
