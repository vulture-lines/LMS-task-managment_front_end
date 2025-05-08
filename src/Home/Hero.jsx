import Gavel3D from "../assets/law-icon1.svg"; // replace with your actual image
import LawIcon1 from "../assets/law-icon1.svg";
import LawIcon2 from "../assets/law-icon2.svg";

const Hero = () => {
  return (
    <section className="relative bg-radial from-green-600 via-green-500 to-green-600 text-white py-20 lg:py-50 px-6 overflow-hidden">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left: Text Content */}
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Master Government Law with Confidence
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Learn from top legal experts and prepare for your law career, civil
            service, or judiciary exams with our tailored courses.
          </p>
          <button className="bg-white text-blue-800 font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-blue-100 transition">
            Get Started
          </button>
        </div>
        {/* Right: Image */}
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <img
            src={Gavel3D}
            alt="Gavel 3D"
            className="w-64 md:w-96 lg:w-[500px] animate-bounce-slow"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
