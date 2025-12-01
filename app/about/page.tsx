import * as React from "react";
import { CheckCircle, Target, Users, Lightbulb } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-default-50 to-white pt-28">
      {/* Hero Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-default-900 mb-6">
            About Eduta
          </h1>
          <p className="text-xl text-default-700 leading-relaxed">
            Empowering learners worldwide with quality education and
            transforming the way people learn through innovative online courses.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full mb-6">
              <Target className="size-5" />
              <span className="font-semibold">Our Mission</span>
            </div>
            <h2 className="text-4xl font-bold text-default-900 mb-6">
              Making Education Accessible to Everyone
            </h2>
            <p className="text-lg text-default-700 leading-relaxed mb-4">
              At Eduta, we believe that quality education should be accessible
              to everyone, regardless of their location or background. Our
              mission is to democratize learning by providing a platform where
              expert instructors can share their knowledge with eager learners
              worldwide.
            </p>
            <p className="text-lg text-default-700 leading-relaxed">
              We&apos;re committed to creating a learning environment that
              fosters growth, encourages curiosity, and enables individuals to
              achieve their personal and professional goals.
            </p>
          </div>
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl p-12 text-white">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-5xl font-bold mb-2">10K+</div>
                <div className="text-primary-100">Active Learners</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">500+</div>
                <div className="text-primary-100">Expert Instructors</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">1K+</div>
                <div className="text-primary-100">Quality Courses</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">95%</div>
                <div className="text-primary-100">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-default-50 py-16">
        <div className="max-w-container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-default-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-default-700 max-w-2xl mx-auto">
              These principles guide everything we do at Eduta
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="size-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-default-900 mb-4">
                Quality First
              </h3>
              <p className="text-default-700 leading-relaxed">
                We maintain the highest standards in course content, ensuring
                every learning experience is valuable and impactful.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Users className="size-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-default-900 mb-4">
                Community Driven
              </h3>
              <p className="text-default-700 leading-relaxed">
                We foster a supportive community where learners and instructors
                connect, collaborate, and grow together.
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="size-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="size-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-default-900 mb-4">
                Innovation
              </h3>
              <p className="text-default-700 leading-relaxed">
                We continuously evolve our platform with cutting-edge technology
                to enhance the learning experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-container mx-auto px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold text-default-900 mb-6 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-default-700 leading-relaxed mb-4">
              Eduta was founded with a simple yet powerful vision: to bridge the
              gap between knowledge seekers and knowledge providers. We
              recognized that talented professionals and experts had valuable
              insights to share, but lacked a platform to reach a global
              audience effectively.
            </p>
            <p className="text-default-700 leading-relaxed mb-4">
              Since our launch, we&apos;ve grown into a thriving community of
              learners and instructors from around the world. Our platform has
              facilitated thousands of learning journeys, helping individuals
              advance their careers, explore new interests, and achieve their
              educational goals.
            </p>
            <p className="text-default-700 leading-relaxed">
              Today, Eduta continues to innovate and expand, always keeping our
              core mission at heart: making quality education accessible,
              affordable, and engaging for everyone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-400 py-16">
        <div className="max-w-container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Join Our Learning Community
          </h2>
          <p className="text-xl text-primary-50 mb-8 max-w-2xl mx-auto">
            Whether you&apos;re here to learn or teach, Eduta is your platform
            for growth and success.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Get Started
            </a>
            <a
              href="/topics"
              className="bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-primary-500"
            >
              Explore Courses
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
