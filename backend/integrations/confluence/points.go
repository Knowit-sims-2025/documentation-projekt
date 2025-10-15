package confluence

var basePoints int = 11

// PointsForPageCreated returnerar poäng för skapande av sida.
func PointsForPageCreated() int {
	complexity := 1

	return basePoints * complexity
}

// PointsForPageUpdated returnerar poäng för uppdatering av sida.
func PointsForPageUpdated(oldContent, newContent string) int {
	pointsToAward := characterDiffCount(oldContent, newContent)

	return pointsToAward
}

// PointsForCommentCreated returnerar poäng för skapande av kommentar.
func PointsForCommentCreated() int {
	complexity := 2

	return complexity * basePoints
}

// PointsForResolvedComment returnerar poäng för att lösa en kommentar.
func PointsForResolvedComment() int {
	complexity := 3

	return complexity * basePoints
}

// --- Hjälpfunktioner ---
// characterDiffCount räknar hur många tecken som skiljer sig mellan två strängar.
func characterDiffCount(a, b string) int {
	diff := len(b) - len(a)

	limits := []int{100, 400, 700, 1000, 1300, 1600, 1900, 2200}
	complexity := 1

	for i, limit := range limits {
		if diff <= limit {
			complexity = i + 1
			return basePoints * complexity
		}
	}

	// Om diff är större än alla gränser
	complexity = len(limits) + 1
	return basePoints * complexity
}
