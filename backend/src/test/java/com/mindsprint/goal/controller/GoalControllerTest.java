package com.mindsprint.goal.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mindsprint.goal.repository.GoalRepository;
import com.mindsprint.repository.UserRepository;
import com.mindsprint.user.Role;
import com.mindsprint.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoalControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.mindsprint.reward.RewardTransactionRepository rewardTransactionRepository;

    @Autowired
    private com.mindsprint.reward.UserAchievementRepository userAchievementRepository;

    @Autowired
    private com.mindsprint.pomodoro.repository.PomodoroSessionRepository pomodoroSessionRepository;

    @BeforeEach
    void setUp() {
        rewardTransactionRepository.deleteAll();
        userAchievementRepository.deleteAll();
        goalRepository.deleteAll();
        pomodoroSessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        rewardTransactionRepository.deleteAll();
        userAchievementRepository.deleteAll();
        goalRepository.deleteAll();
        pomodoroSessionRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createGoal_Success() throws Exception {
        String token = registerAndExtractToken("user@mindsprint.com");

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Read 10 Books",
                                  "category": "Education",
                                  "targetDate": "2027-12-31",
                                  "description": "Read more often"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Goal created successfully"))
                .andExpect(jsonPath("$.data.title").value("Read 10 Books"))
                .andExpect(jsonPath("$.data.category").value("Education"))
                .andExpect(jsonPath("$.data.description").value("Read more often"))
                .andExpect(jsonPath("$.data.progress").value(0))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    void createGoal_Unauthenticated_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Read 10 Books",
                                  "category": "Education",
                                  "targetDate": "2027-12-31"
                                }
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getGoals_ReturnsPaginatedList() throws Exception {
        String token = registerAndExtractToken("user@mindsprint.com");
        createGoalAndExtractId(token, "Goal 1");
        createGoalAndExtractId(token, "Goal 2");

        mockMvc.perform(get("/api/goals")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalElements").value(2));
    }

    @Test
    void getActiveGoals_ReturnsOnlyActiveList() throws Exception {
        String token = registerAndExtractToken("user@mindsprint.com");
        Long goalId = createGoalAndExtractId(token, "Goal 1");

        // Update to COMPLETED
        mockMvc.perform(patch("/api/goals/{id}", goalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "COMPLETED"
                                }
                                """))
                .andExpect(status().isOk());

        // Create another goal (active)
        createGoalAndExtractId(token, "Goal 2");

        mockMvc.perform(get("/api/goals/active")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Goal 2"));
    }

    @Test
    void updateGoal_UpdatesStatusAndDescription() throws Exception {
        String token = registerAndExtractToken("user@mindsprint.com");
        Long goalId = createGoalAndExtractId(token, "Learn Spring Boot");

        mockMvc.perform(patch("/api/goals/{id}", goalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "status": "COMPLETED",
                                  "description": "Finished course"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.description").value("Finished course"))
                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
    }

    @Test
    void deleteGoal_DeletesGoalSuccessfully() throws Exception {
        String token = registerAndExtractToken("user@mindsprint.com");
        Long goalId = createGoalAndExtractId(token, "Goal to Delete");

        mockMvc.perform(delete("/api/goals/{id}", goalId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Goal deleted successfully"));

        mockMvc.perform(patch("/api/goals/{id}", goalId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    private String registerAndExtractToken(String email) throws Exception {
        userRepository.save(User.builder()
                .name("Goal User")
                .email(email)
                .password(passwordEncoder.encode("Password123"))
                .role(Role.USER)
                .emailVerified(true)
                .build());

        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "Password123"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("token").asText();
    }

    private Long createGoalAndExtractId(String token, String title) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "%s",
                                  "category": "Personal",
                                  "targetDate": "2027-12-31"
                                }
                                """.formatted(title)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.path("data").path("id").asLong();
    }
}
