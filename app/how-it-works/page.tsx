import Link from 'next/link'

export const metadata = {
  title: 'How It Works — PryroReview',
  description: 'Learn how to submit a verified review on PryroReview.',
}

export default function HowItWorksPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-900">← Back</Link>

      <h1 className="mt-6 text-2xl font-bold text-zinc-900">How It Works</h1>
      <p className="mt-3 text-sm font-normal text-gray-700 leading-relaxed">
        Submitting a verified review on PryroReview is simple. Follow these four steps to share your
        experience with any business or service in Rwanda.
      </p>

      <h3 className="mt-10 text-base font-semibold text-zinc-900">Step 1: Search for a company</h3>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Use the search bar on the homepage to find the business you want to review. You can search by
        name, category, or location. If the company is not yet listed, you can add it to the directory
        yourself — it only takes a moment.
      </p>

      <h3 className="mt-8 text-base font-semibold text-zinc-900">Step 2: Pay 20 RWF via Mobile Money</h3>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        To verify you are a real customer, you will pay a small fee of 20 RWF using MTN MoMo or Airtel
        Money. This payment confirms your identity and prevents fake or spam reviews from flooding the
        platform. Once your payment is confirmed, you can proceed to the next step.
      </p>

      <h3 className="mt-8 text-base font-semibold text-zinc-900">Step 3: Write your honest review</h3>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        Rate the company from one to five stars and write a short description of your experience. Be
        specific — mention what went well and what could be improved. Your review should help other
        customers make informed decisions. You can also choose a category like Staff Attitude, Speed
        of Service, or Overall Experience.
      </p>

      <h3 className="mt-8 text-base font-semibold text-zinc-900">Step 4: Your review goes live immediately</h3>
      <p className="mt-2 text-sm font-normal text-gray-700 leading-relaxed">
        After you submit your review, it is published instantly on the company's profile page. It will
        remain visible permanently. Businesses cannot pay to remove or hide reviews, so your feedback
        becomes part of the public record. Other customers can read your review to help them choose
        where to spend their money.
      </p>
    </div>
  )
}
