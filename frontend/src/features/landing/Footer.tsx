export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} MediCloud. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-1">Built with ❤️ for a healthier Indonesia.</p>
      </div>
    </footer>
  );
};