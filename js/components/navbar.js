export function Navbar() {
  return `
    <nav class="px-4 py-4 sm:flex sm:items-center sm:justify-between">
      <section class="flex justify-between">
        <img src="/img/logo.svg" class="h-6" alt="CLIMAS" />
        <button class="text-gray-700 sm:hidden">
          <svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 50 50">
            <path d="M 0 7.5 L 0 12.5 L 50 12.5 L 50 7.5 Z M 0 22.5 L 0 27.5 L 50 27.5 L 50 22.5 Z M 0 37.5 L 0 42.5 L 50 42.5 L 50 37.5 Z"></path>
          </svg>
        </button>
      </section>
      <div class="flex flex-col items-start mt-3 gap-2 sm:flex-row sm:m-0">
        <button class="text-gray-600 hover:bg-gray-200 w-full text-left px-2 rounded hover:text-gray-900">Inicio</button>
        <button class="text-gray-600 hover:bg-gray-200 w-full text-left px-2 rounded hover:text-gray-900">Doctores y Especialidades</button>
        <button class="text-gray-600 hover:bg-gray-200 w-full text-left px-2 rounded hover:text-gray-900">Contacto</button>
      </div>
    </nav>
  `
}