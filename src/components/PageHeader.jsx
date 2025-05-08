import { ChevronRight } from "lucide-react";

function PageHeader({ title, description }) {
  return (
    <>
      <div className="p-4 lg:p-8">
        {/* <p className="flex items-center font-medium text-sm leading-6">
          <span>Home</span> <ChevronRight className="h-4" />
          <span className="">Dashboard</span>
        </p> */}
        <h1 className="font-semibold text-lg lg:text-2xl tracking-tight mt-2">
          {title} 
        </h1>
        <p className="text-sm lg:text-base">{description}</p>
      </div>
    </>
  );
}

export default PageHeader;
