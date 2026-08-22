package com.mindsprint.pomodoro.dto;
import lombok.Data;
public class CompleteSessionRequest { private int actualDuration; public int getActualDuration() { return actualDuration; } public void setActualDuration(int actualDuration) { this.actualDuration = actualDuration; } }
