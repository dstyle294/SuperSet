// this fucntion will convert the createdAt to this format: "May 2023"
export const formatMemberSince = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleString("default", { month: "short" })
  const year = date.getFullYear()
  return `${month} ${year}`
}

// this function will convert the createdAt to this format: "May 15, 2023"
export const formatPublishDate = (dateString: string) => {
  const date = new Date(dateString)
  const month = date.toLocaleString("default", { month: "long" })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}
