package contextkeys

// contextKey är en egen typ för att undvika kollisioner med andra paket.
type contextKey string

// UserContextKey är nyckeln som används för att lagra och hämta användar-ID från contexten.
const UserContextKey = contextKey("userID")
