import Link from 'next/link'

export const metadata = {
  title: 'About PryroReview',
  description: "Rwanda's first verified business review platform.",
}

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">← Back</Link>

      <h1 className="mt-6 text-2xl font-bold text-zinc-900">About PryroReview</h1>
      <p className="mt-3 text-sm font-normal text-gray-700 leading-relaxed">
        PryroReview is Rwanda's first verified business review platform. Every review published on this
        platform is backed by a real Mobile Money payment — meaning only genuine customers can submit
        feedback. We built this to give Rwandan citizens a trusted voice and to hold businesses
        accountable for the service they deliver.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Our Mission</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Our mission is to make business accountability the norm in Rwanda. Every citizen deserves
        honest information before choosing a bank, hospital, telecom provider, or government service.
        PryroReview gives people a permanent, public record of their experiences — and businesses a
        clear signal of where they need to improve.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Why We Built This</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Most review platforms suffer from fake reviews — either from competitors posting negative
        feedback or businesses flooding their own pages with five-star ratings. In Rwanda, there was
        no platform at all dedicated to local businesses and public services. We built PryroReview to
        solve both problems at once: require a small payment to verify the reviewer is real, and focus
        exclusively on Rwandan businesses and services.
      </p>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        The 20 RWF fee is not about revenue. It is a verification mechanism. Anyone willing to pay
        even a small amount to leave a review is almost certainly a real customer with a real opinion.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">How We're Different</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Unlike global review platforms, PryroReview is built specifically for Rwanda. Every review
        requires a confirmed Mobile Money payment before it is published. Businesses cannot pay to
        remove reviews, hide feedback, or boost their ratings. The platform is fully transparent —
        what you see is what real customers experienced.
      </p>

      <h2 className="mt-10 text-lg font-semibold text-zinc-900">Who Can Use It</h2>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Anyone with an MTN MoMo or Airtel Money account can submit a review. You do not need a
        subscription or a special account. Simply search for a company, pay the small verification
        fee, and write your honest experience. Businesses of any size can be listed — from large
        telecoms to small local shops.
      </p>
    </div>
  )
}
