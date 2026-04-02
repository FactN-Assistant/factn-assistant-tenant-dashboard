
const testData = {
  username : "Ranga Mudunkotuwa"
}

export default function LoggedUser() {
  return(
    <div className="flex flex-row gap-1 border rounded-full py-0.5 pl-0.5 pr-3 items-center justify-center">
      <div className="flex border rounded-full p-4 bg-neutral-600">

      </div>
      <p >
        {testData.username}
      </p>
    </div>
  )
}