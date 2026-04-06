
const testData = {
  username : "Ranga Mudunkotuwa"
}

export default function LoggedUser() {
  return(
    <div className="flex flex-row gap-1 border rounded-full py-1 px-3 items-center justify-center bg-neutral-900">
      <p >
        {testData.username}
      </p>
    </div>
  )
}