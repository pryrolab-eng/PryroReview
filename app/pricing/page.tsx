import Link from 'next/link'

export const metadata = {
  title: 'Pricing — PryroReview',
  description: 'Learn about pricing and fees on PryroReview.',
}

export default function PricingPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">← Back</Link>

      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Pricing</h1>
      <p className="mt-3 text-sm font-normal text-gray-700 leading-relaxed">
        PryroReview uses a simple pricing model designed to keep reviews honest and businesses
        accountable. There are no hidden fees, no subscriptions, and no special access tiers. Here is
        exactly what it costs to use the platform.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">For Reviewers</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Every review you submit costs 20 RWF. This fee is paid via MTN Mobile Money or Airtel Money
        before you write your review. The payment verifies that you are a real person, not a bot or a
        competitor posting fake feedback. Once you pay, you can rate the company, choose a category,
        and write a detailed comment about your experience.
      </p>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        You pay per review, not per account. If you want to review five different businesses, you will
        pay 20 RWF for each one — a total of 100 RWF. There are no monthly fees or subscriptions. You
        only pay when you actually submit a review.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">For Businesses</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Listing your business on PryroReview is completely free. Any user can add a business to the
        directory by entering its name, category, and location. Once listed, customers can find your
        business and leave reviews. You do not need to create an account, claim your profile, or pay
        any listing fees.
      </p>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Businesses cannot pay to remove reviews, hide negative feedback, or boost their ratings.
        PryroReview does not sell premium features, advertising slots, or special visibility packages.
        The only way to improve your rating is to improve your service.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Why We Charge</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        The 20 RWF fee is not about making money. It is a verification mechanism. Requiring even a
        small payment ensures that only real customers with real experiences can leave reviews.
        Competitors cannot flood your page with fake one-star reviews, and businesses cannot flood
        their own pages with fake five-star reviews.
      </p>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        The fee also covers the cost of running the platform — server hosting, database storage, and
        Mobile Money transaction fees. Any excess revenue goes toward improving the platform and
        expanding coverage to more regions and categories.
      </p>
    </div>
  )
}
