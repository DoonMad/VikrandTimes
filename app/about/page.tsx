
export const metadata = {
  title: "About Us",
  description:
    "Learn about Vikrand Times, a Marathi weekly newspaper, and its founder Arunkumar Mundada.",
};


export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        About Us
      </h1>

      {/* About Vikrand Times */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          About Vikrand Times
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Vikrand Times (विकास क्रांती दल) is a Marathi weekly newspaper that has
          been serving readers for over a decade. The newspaper focuses on local
          news, social issues, public interest stories, and community-related
          reporting.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Published once a week, Vikrand Times aims to present news in a clear,
          responsible, and accessible manner for Marathi readers. Over the
          years, the newspaper has built a loyal readership by staying rooted in
          ground-level reporting and covering issues that matter to everyday
          citizens.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          With the launch of this website, Vikrand Times is taking a step towards
          making its content more accessible to readers in digital form, while
          continuing its commitment to honest and independent journalism.
        </p>
      </section>

      {/* About Founder */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          About the Founder
        </h2>
        <p className="text-gray-700 leading-relaxed">
          Vikrand Times is founded and edited by <strong>Arunkumar Mundada</strong>,
          a senior journalist with over <strong>45 years of experience</strong> in
          the field of journalism.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          Throughout his career, he has worked with some of the most well-known
          newspaper groups in Maharashtra, including Maharashtra Times, The
          Times of India, and Tarun Bharat, among others.
        </p>
        <p className="text-gray-700 leading-relaxed mt-3">
          With decades of experience in reporting, editing, and editorial
          leadership, he continues to guide Vikrand Times with a strong focus on
          journalistic integrity, public accountability, and meaningful
          reporting.
        </p>
      </section>
    </div>
  );
}
