import { Request, Response } from 'express';
import LotteryService, { Rewards } from '../../services/LotteryService';

const lotteries = [
    {
        logoURL:
            'https://thx-storage-bucket.s3.eu-west-3.amazonaws.com/forestknight_logo_long-b6s7vU9FtMR5irTqYv5z45.png',
        project: 'Forest Knight',
        description:
            'In the realms of Forest Knight, many items are digital collectibles allowing the players a full ownership. You as a player can decide what you want to do with them, use them, trade them or combine them! A new frontier of gaming is here.',
        participantCount: 100,
        winners: {
            THX02G6NMUMU0052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXSUR9F62ZRE052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXT51NWPZY0Z052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXH7TQX5FETL052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXMYH9D2GFAI052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXNDZDDSSI3O052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXEUIAY54H01052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXV1BVL7XZBF052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXBI11LY2C2P052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
            THXNT5QAUHBNN052024: Rewards.ForestKnight.RunestoneOfTheEclipse,
        },
    },
];

const controller = async (req: Request, res: Response) => {
    const result = await LotteryService.getWinners(lotteries);
    res.json(result);
};

export { controller };
