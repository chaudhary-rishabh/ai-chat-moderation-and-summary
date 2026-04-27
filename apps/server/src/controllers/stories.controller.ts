import type { NextFunction, Request, Response } from "express";
import * as storiesService from "../services/stories.service";

export const createStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const story = await storiesService.createStoryService(req.user!.userId, req.body);
    res.status(201).json(story);
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const feed = await storiesService.getFeedService(req.user!.userId);
    res.json(feed);
  } catch (error) {
    next(error);
  }
};

export const viewStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await storiesService.viewStoryService(req.params.storyId as string, req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reactToStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reaction = await storiesService.reactToStoryService(req.params.storyId as string, req.user!.userId, req.body.emoji);
    res.status(201).json(reaction);
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await storiesService.deleteStoryService(req.params.storyId as string, req.user!.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getViewers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const viewers = await storiesService.getStoryViewersService(req.params.storyId as string, req.user!.userId);
    res.json(viewers);
  } catch (error) {
    next(error);
  }
};
