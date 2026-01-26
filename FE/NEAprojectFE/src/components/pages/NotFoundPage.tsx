import { useNavigate } from "react-router";

const NotFoundPage = () => {
	const navigate = useNavigate();

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-gray-100">
			<div className="text-center px-6">
				<h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400 mb-4">
					404
				</h1>
				<p className="text-lg text-gray-300 mb-8">
					Oops... seems like you wandered into the void 🌀
				</p>
				<button
					onClick={() => navigate("/")}
					className="px-6 py-3 text-lg font-medium rounded-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-600 hover:to-sky-600 shadow-lg shadow-blue-500/20 transition-all"
				>
					Take Me Home 🏠
				</button>
			</div>
		</div>
	);
};

export default NotFoundPage;
