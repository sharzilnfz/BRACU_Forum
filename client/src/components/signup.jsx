import { Link } from 'react-router-dom';

const signup = () => {
  return (
    <div className="min-h-screen pt-24 px-4 bg-gray-950">
      <form
        action=""
        className="max-w-md mx-auto bg-gray-900 p-8 rounded-xl shadow-2xl border border-gray-800"
      >
        <h2 className="text-2xl font-bold text-center mb-8 text-white">
          Brac University Students Only!
        </h2>
        <div className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder-gray-500"
          />
          <button
            type="submit"
            className="bg-cyan-300 hover:bg-cyan-600 text-black font-semibold py-3 rounded-lg transition-colors mt-2"
          >
            Sign Up
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            Already Have an account?{' '}
            <Link
              to="/signin"
              className="text-cyan-400 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default signup;
