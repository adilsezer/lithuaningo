// services/FirebaseDataService.ts
import firestore from "@react-native-firebase/firestore";

export interface Stats {
  currentStreak: number;
  longestStreak: number;
  totalStudiedCards: number;
  todayStudiedCards: number;
  weeklyStudiedCards: number;
  dailyAverage: number;
  minutesSpentToday: number;
  minutesSpentThisWeek: number;
  minutesSpentTotal: number;
  todayTotalCards: number;
  correctAnswers: number; // Added this field to track correct answers
}

export interface LearningCard {
  type: "multiple_choice" | "fill_in_the_blank" | "true_false";
  question: string;
  image?: string;
  options?: string[];
  correctAnswer?: string;
}

// Fetch stats and set up a real-time listener
export const fetchStats = (
  userId: string,
  onStatsChange: (stats: Stats | null) => void
) => {
  return firestore()
    .collection("stats")
    .doc(userId)
    .onSnapshot(
      (doc) => {
        if (doc.exists) {
          const statsData = doc.data() as Stats;
          onStatsChange(statsData);
        } else {
          onStatsChange(null);
        }
      },
      (error) => {
        console.error("Error fetching stats:", error);
        onStatsChange(null); // Ensure we handle errors by passing null
      }
    );
};

// Fetch learning cards and set up a real-time listener
export const fetchLearningCards = (
  onCardsChange: (cards: LearningCard[]) => void
) => {
  return firestore()
    .collection("learningCards")
    .onSnapshot(
      (snapshot) => {
        const cards = snapshot.docs.map((doc) => doc.data() as LearningCard);
        onCardsChange(cards);
      },
      (error) => {
        console.error("Error fetching learning cards:", error);
        onCardsChange([]); // Ensure we handle errors by passing an empty array
      }
    );
};

export const fetchLeaderboard = (
  onLeadersChange: (
    leaders: { id: string; name: string; score: number }[]
  ) => void
) => {
  return firestore()
    .collection("stats")
    .orderBy("totalStudiedCards", "desc")
    .limit(20)
    .onSnapshot(
      async (snapshot) => {
        const leaders = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const userDoc = await firestore()
              .collection("users")
              .doc(doc.id)
              .get();
            const userName = userDoc.exists ? userDoc.data()?.name : "Unknown";
            return {
              id: doc.id,
              name: userName,
              score: data.totalStudiedCards,
            };
          })
        );
        onLeadersChange(leaders);
      },
      (error) => {
        console.error("Error fetching leaders:", error);
        onLeadersChange([]);
      }
    );
};

// Update user stats
export const updateUserStats = async (
  userId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<void> => {
  try {
    const userStatsRef = firestore().collection("stats").doc(userId);
    const userStatsSnapshot = await userStatsRef.get();

    let userStats: Stats;
    if (userStatsSnapshot.exists) {
      userStats = userStatsSnapshot.data() as Stats;
    } else {
      // Initialize default stats if not exist
      userStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalStudiedCards: 0,
        todayStudiedCards: 0,
        weeklyStudiedCards: 0,
        dailyAverage: 0,
        minutesSpentToday: 0,
        minutesSpentThisWeek: 0,
        minutesSpentTotal: 0,
        todayTotalCards: 0,
        correctAnswers: 0,
      };
    }

    const newTotalStudiedCards = userStats.totalStudiedCards + 1;
    const newTodayStudiedCards = userStats.todayStudiedCards + 1;
    const newWeeklyStudiedCards = userStats.weeklyStudiedCards + 1;
    const newTodayTotalCards = userStats.todayTotalCards + 1;

    // Update time spent
    const newMinutesSpentToday = userStats.minutesSpentToday + timeSpent;
    const newMinutesSpentThisWeek = userStats.minutesSpentThisWeek + timeSpent;
    const newMinutesSpentTotal = userStats.minutesSpentTotal + timeSpent;

    // Calculate daily average
    const daysActive = Math.ceil(newMinutesSpentTotal / (24 * 60)); // Assuming 24 hours in a day
    const newDailyAverage = newTotalStudiedCards / daysActive;

    // Update streaks
    const newCurrentStreak = userStats.currentStreak + 1; // Simplified, would need logic to reset if not consecutive days
    const newLongestStreak = Math.max(
      userStats.longestStreak,
      newCurrentStreak
    );

    await userStatsRef.set({
      totalStudiedCards: newTotalStudiedCards,
      todayStudiedCards: newTodayStudiedCards,
      weeklyStudiedCards: newWeeklyStudiedCards,
      todayTotalCards: newTodayTotalCards,
      minutesSpentToday: newMinutesSpentToday,
      minutesSpentThisWeek: newMinutesSpentThisWeek,
      minutesSpentTotal: newMinutesSpentTotal,
      dailyAverage: newDailyAverage,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      correctAnswers: isCorrect
        ? userStats.correctAnswers + 1
        : userStats.correctAnswers,
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    throw new Error("Failed to update user stats.");
  }
};
