import firestore, {
  FirebaseFirestoreTypes,
} from "@react-native-firebase/firestore";
import { getStartOfToday, getStartOfYesterday } from "@src/utils/dateUtils";

export interface Stats {
  correctAnswers: number;
  currentStreak: number;
  lastCompleted: FirebaseFirestoreTypes.Timestamp;
  longestStreak: number;
  minutesSpentToday: number;
  minutesSpentTotal: number;
  todayStudiedCards: number;
  totalStudiedCards: number;
  weeklyCorrectAnswers: number;
}

export interface LearningCard {
  id: string;
  type: "multiple_choice" | "fill_in_the_blank";
  question: string;
  image?: string;
  options?: string[];
  answer: string;
  translation: string;
  baseForm: string;
  baseFormTranslation: string;
  displayOrder: number;
  audio?: string;
  extraInfo?: string;
  level?: string;
  tags?: string;
}

export interface LearnedCard {
  id: string;
}

const fetchUserProfile = async (userId: string) => {
  const userDoc = await firestore()
    .collection("userProfiles")
    .doc(userId)
    .get();
  if (!userDoc.exists) {
    throw new Error("User profile not found");
  }
  return userDoc.data();
};

const fetchLearningCards = async (userId: string): Promise<LearningCard[]> => {
  try {
    const userProfile = await fetchUserProfile(userId);
    const learnedCardIds = userProfile?.learnedCards || [];
    const learnedCardIdsAsStrings = learnedCardIds.map((card: any) =>
      typeof card === "string" ? card : card.id
    );

    const allNewCards: LearningCard[] = [];
    const batchSize = 15;
    let lastVisible = null;

    // Fetch cards in batches, excluding already learned cards
    while (allNewCards.length < batchSize) {
      let query = firestore()
        .collection("learningCards")
        .orderBy("displayOrder")
        .limit(batchSize);

      if (lastVisible) {
        query = query.startAfter(lastVisible);
      }

      const newCardsSnapshot = await query.get();

      if (newCardsSnapshot.empty) {
        console.log("No more cards to fetch, snapshot is empty");
        break;
      }

      const newCards = newCardsSnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as LearningCard)
        )
        .filter((card) => !learnedCardIdsAsStrings.includes(card.id));

      allNewCards.push(...newCards);

      if (newCardsSnapshot.docs.length < batchSize) {
        console.log("Fetched less than batch size, breaking out of loop");
        break;
      }

      lastVisible = newCardsSnapshot.docs[newCardsSnapshot.docs.length - 1];
    }

    return allNewCards.slice(0, batchSize);
  } catch (error) {
    console.error("Error fetching learning cards:", error);
    return [];
  }
};

const updateUserLearnedCards = async (
  userId: string,
  newLearnedCards: string[]
): Promise<void> => {
  try {
    const userProfile = await fetchUserProfile(userId);
    const existingLearnedCards = userProfile?.learnedCards || [];

    const updatedLearnedCards = [
      ...new Set([...existingLearnedCards, ...newLearnedCards]),
    ];

    await firestore().collection("userProfiles").doc(userId).update({
      learnedCards: updatedLearnedCards,
    });
  } catch (error) {
    console.error("Error updating learned cards:", error);
    throw new Error("Failed to update learned cards.");
  }
};

const updateCompletionDate = async (userId: string): Promise<void> => {
  try {
    await firestore().collection("userProfiles").doc(userId).update({
      lastCompleted: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating completion date: ", error);
    throw new Error("Failed to update completion date.");
  }
};

const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await firestore()
      .collection("userProfiles")
      .doc(userId)
      .get();
    if (!userDoc.exists) {
      return false;
    }
    const data = userDoc.data();
    return Boolean(data?.isAdmin);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

const fetchStats = (
  userId: string,
  onStatsChange: (stats: Stats | null) => void
) => {
  return firestore()
    .collection("userProfiles")
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
        onStatsChange(null);
      }
    );
};

const fetchLeaderboard = (
  onLeadersChange: (
    leaders: { id: string; name: string; score: number }[]
  ) => void
) => {
  return firestore()
    .collection("userProfiles")
    .orderBy("weeklyCorrectAnswers", "desc")
    .limit(20)
    .onSnapshot(
      async (snapshot) => {
        const leaders = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              score: data.weeklyCorrectAnswers, // Use weekly correct answers
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

const updateStreak = (
  lastCompleted: FirebaseFirestoreTypes.Timestamp,
  currentStreak: number
): number => {
  const lastCompletedDate = lastCompleted.toDate();
  const startOfToday = getStartOfToday();
  const startOfYesterday = getStartOfYesterday();

  if (lastCompletedDate >= startOfToday) {
    return currentStreak;
  } else if (lastCompletedDate >= startOfYesterday) {
    return currentStreak + 1;
  } else {
    return 1;
  }
};

const updateUserStats = async (
  userId: string,
  isCorrect: boolean,
  timeSpent: number
): Promise<void> => {
  try {
    const userStatsRef = firestore().collection("userProfiles").doc(userId);
    const userStatsSnapshot = await userStatsRef.get();

    let userStats: Stats;
    if (userStatsSnapshot.exists) {
      userStats = userStatsSnapshot.data() as Stats;
    } else {
      userStats = {
        currentStreak: 0,
        longestStreak: 0,
        totalStudiedCards: 0,
        todayStudiedCards: 0,
        minutesSpentToday: 0,
        minutesSpentTotal: 0,
        correctAnswers: 0,
        lastCompleted: firestore.Timestamp.fromDate(new Date(0)),
        weeklyCorrectAnswers: 0, // Initialize new property
      };
    }

    const startOfToday = getStartOfToday();
    const lastCompleted = userStats.lastCompleted?.toDate() || new Date(0);

    let newTodayStudiedCards = userStats.todayStudiedCards ?? 0;
    let newMinutesSpentToday = userStats.minutesSpentToday ?? 0;

    if (lastCompleted < startOfToday) {
      newTodayStudiedCards = 0;
      newMinutesSpentToday = 0;
    }

    const newCurrentStreak = updateStreak(
      userStats.lastCompleted || firestore.Timestamp.fromDate(new Date(0)),
      userStats.currentStreak ?? 0
    );
    const newLongestStreak = Math.max(
      userStats.longestStreak ?? 0,
      newCurrentStreak
    );

    const newTotalStudiedCards = (userStats.totalStudiedCards ?? 0) + 1;
    newTodayStudiedCards += 1;

    newMinutesSpentToday += timeSpent;
    const newMinutesSpentTotal = (userStats.minutesSpentTotal ?? 0) + timeSpent;

    const daysActive = Math.ceil(newMinutesSpentTotal / (24 * 60));

    const newWeeklyCorrectAnswers = isCorrect
      ? (userStats.weeklyCorrectAnswers ?? 0) + 1
      : userStats.weeklyCorrectAnswers ?? 0;

    await userStatsRef.update({
      totalStudiedCards: newTotalStudiedCards,
      todayStudiedCards: newTodayStudiedCards,
      minutesSpentToday: newMinutesSpentToday,
      minutesSpentTotal: newMinutesSpentTotal,
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      correctAnswers: isCorrect
        ? (userStats.correctAnswers ?? 0) + 1
        : userStats.correctAnswers ?? 0,
      weeklyCorrectAnswers: newWeeklyCorrectAnswers, // Update new property
    });
  } catch (error) {
    console.error("Error updating stats:", error);
    throw new Error("Failed to update user stats.");
  }
};

const addCard = async (card: LearningCard) => {
  try {
    const newCard = await firestore().collection("learningCards").add(card);
    return { success: true, id: newCard.id };
  } catch (error) {
    console.error("Error adding card:", error);
    return { success: false, error };
  }
};

const updateCard = async (
  cardId: string,
  updatedCard: Partial<LearningCard>
) => {
  try {
    await firestore()
      .collection("learningCards")
      .doc(cardId)
      .update(updatedCard);
    return { success: true };
  } catch (error) {
    console.error("Error updating card:", error);
    return { success: false, error };
  }
};

const deleteCard = async (cardId: string) => {
  try {
    await firestore().collection("learningCards").doc(cardId).delete();
    return { success: true };
  } catch (error) {
    console.error("Error deleting card:", error);
    return { success: false, error };
  }
};

export const FirebaseDataService = {
  fetchLearningCards,
  updateUserLearnedCards,
  updateCompletionDate,
  isAdmin,
  fetchStats,
  fetchLeaderboard,
  updateUserStats,
  addCard,
  updateCard,
  deleteCard,
};
