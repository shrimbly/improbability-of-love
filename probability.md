BEGIN

# Step 1: Get input data
partner1_birth_location = getUserInput("Enter birth location of Partner 1")
partner2_birth_location = getUserInput("Enter birth location of Partner 2")
meeting_location = getUserInput("Enter location where they met")

# Step 2: Get population data
partner1_birth_population = getPopulation(partner1_birth_location)
partner2_birth_population = getPopulation(partner2_birth_location)
meeting_population = getPopulation(meeting_location)
total_population = getWorldPopulation()

# Step 3: Compute probability of being born in the same city
IF partner1_birth_location == partner2_birth_location == meeting_location THEN
    prob_birth_same_city = (1 / partner1_birth_population) * (1 / partner2_birth_population)
    output("Probability of both being born and meeting in the same city: " + prob_birth_same_city)

ELSE
    # Step 4: Compute probability of migration
    prob_partner1_moves = (1 / partner1_birth_population) * (1 / meeting_population)
    prob_partner2_moves = (1 / partner2_birth_population) * (1 / meeting_population)

    # Step 5: Combine probabilities based on migration cases
    IF partner1_birth_location != meeting_location AND partner2_birth_location != meeting_location THEN
        prob_both_move = prob_partner1_moves * prob_partner2_moves
    ELSE IF partner1_birth_location == meeting_location OR partner2_birth_location == meeting_location THEN
        prob_one_moves = max(prob_partner1_moves, prob_partner2_moves)

    # Step 6: Compute final probability based on meeting method
    meeting_method = getUserInput("How did they meet? (Friends, Online, Work, School, Hobbies, Other)")
    prob_meeting_method = getMeetingProbability(meeting_method)

    # Step 7: Final probability calculation
    IF partner1_birth_location == meeting_location AND partner2_birth_location == meeting_location THEN
        final_probability = prob_birth_same_city * prob_meeting_method
    ELSE IF partner1_birth_location != meeting_location AND partner2_birth_location != meeting_location THEN
        final_probability = prob_both_move * prob_meeting_method
    ELSE
        final_probability = prob_one_moves * prob_meeting_method

    output("Final probability of meeting: 1 in " + (1 / final_probability))

END
