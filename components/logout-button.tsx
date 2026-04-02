import { Button } from "./ui/button";

export default function Logout() {
  const handleClick = () => {
    //logout logic
    console.log("Logout");
  }

  return (
    <Button 
      className="border py-5 px-4 text-neutral-200 rounded-full bg-green-700 hover:bg-green-600 transition-all duration-200 ease-in-out"
      onClick={handleClick}
    >
      Logout
    </Button>
  )
}