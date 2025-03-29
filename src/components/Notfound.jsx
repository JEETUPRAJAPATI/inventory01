export default function NotFound() {
    return (
        <section
            className="w-full h-screen flex flex-col items-center justify-center bg-cover bg-center text-center relative"
            style={{
                backgroundImage: "url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)",
            }}
        >
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            <div className="relative z-10">
                <h1 className="text-9xl font-bold text-white">404</h1>
                <h3 className="text-4xl font-semibold text-white mt-4">Looks like you're lost</h3>
                <p className="text-lg text-white mt-2">The page you are looking for is not available!</p>
                <a
                    href="/"
                    className="inline-block mt-6 px-6 py-3 text-lg text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
                >
                    Go to Home
                </a>
            </div>
        </section>
    );
}
