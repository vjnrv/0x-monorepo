import { constants, FillResults, orderUtils } from '@0x/contracts-test-utils';
import {
    AbstractBalanceAndProxyAllowanceLazyStore as LazyStore,
    ExchangeTransferSimulator,
    Order,
    TradeSide,
    TransferType,
} from '@0x/order-utils';
import { BigNumber } from '@0x/utils';
import * as _ from 'lodash';

export enum FillOrderError {
    OrderUnfillable = 'ORDER_UNFILLABLE',
    InvalidSender = 'INVALID_SENDER',
    InvalidTakerAmount = 'INVALID_TAKER_AMOUNT',
    InvalidMakerAmount = 'INVALID_MAKER_AMOUNT',
    InvalidTaker = 'INVALID_TAKER',
    InvalidFillPrice = 'INVALID_FILL_PRICE',
    TransferFailed = 'TRANSFER_FAILED',
}

/**
 * Simplified fill order simulator.
 */
export class FillOrderSimulator {
    public readonly lazyStore: LazyStore;
    private readonly _transferSimulator: ExchangeTransferSimulator;

    constructor(lazyStore: LazyStore) {
        this.lazyStore = lazyStore;
        this._transferSimulator = new ExchangeTransferSimulator(lazyStore);
    }

    public async simulateFillOrderAsync(
        order: Order,
        takerAddress: string,
        takerAssetFillAmount: BigNumber,
        takerAssetFilledAmount: BigNumber = constants.ZERO_AMOUNT,
    ): Promise<FillResults> {
        const remainingTakerAssetAmount = order.takerAssetAmount.minus(takerAssetFilledAmount);
        const makerAssetFilledAmount = orderUtils.getPartialAmountFloor(
            takerAssetFilledAmount,
            order.takerAssetAmount,
            order.makerAssetAmount,
        );

        validateFill(
            order,
            takerAddress,
            takerAssetFillAmount,
            makerAssetFilledAmount,
            takerAssetFilledAmount,
            remainingTakerAssetAmount,
        );

        const finalTakerAssetFillAmount = BigNumber.min(takerAssetFillAmount, remainingTakerAssetAmount);
        const makerAssetFillAmount = orderUtils.getPartialAmountFloor(
            finalTakerAssetFillAmount,
            order.takerAssetAmount,
            order.makerAssetAmount,
        );
        const makerFeePaid = orderUtils.getPartialAmountFloor(
            makerAssetFillAmount,
            order.makerAssetAmount,
            order.makerFee,
        );
        const takerFeePaid = orderUtils.getPartialAmountFloor(
            finalTakerAssetFillAmount,
            order.takerAssetAmount,
            order.takerFee,
        );

        try {
            if (order.makerAddress === order.feeRecipientAddress && order.takerAssetData === order.makerFeeAssetData) {
                // Transfer combined taker assets and maker fees.
                await this._transferSimulator.transferFromAsync(
                    order.takerAssetData,
                    takerAddress,
                    order.makerAddress,
                    finalTakerAssetFillAmount.plus(makerFeePaid),
                    TradeSide.Taker,
                    TransferType.Trade,
                );
            } else {
                // Taker -> Maker
                await this._transferSimulator.transferFromAsync(
                    order.takerAssetData,
                    takerAddress,
                    order.makerAddress,
                    finalTakerAssetFillAmount,
                    TradeSide.Taker,
                    TransferType.Trade,
                );
                // Maker fee -> fee recipient
                if (makerFeePaid.isGreaterThan(0)) {
                    await this._transferSimulator.transferFromAsync(
                        order.makerFeeAssetData,
                        order.makerAddress,
                        order.feeRecipientAddress,
                        makerFeePaid,
                        TradeSide.Maker,
                        TransferType.Fee,
                    );
                }
            }
            if (takerAddress === order.feeRecipientAddress && order.makerAssetData === order.takerFeeAssetData) {
                // Transfer combined maker assets and taker fees.
                await this._transferSimulator.transferFromAsync(
                    order.makerAssetData,
                    order.makerAddress,
                    takerAddress,
                    makerAssetFillAmount.plus(takerFeePaid),
                    TradeSide.Maker,
                    TransferType.Trade,
                );
            } else {
                // Maker -> Taker
                await this._transferSimulator.transferFromAsync(
                    order.makerAssetData,
                    order.makerAddress,
                    takerAddress,
                    makerAssetFillAmount,
                    TradeSide.Maker,
                    TransferType.Trade,
                );
                // Taker fee -> fee recipient
                if (takerFeePaid.isGreaterThan(0)) {
                    await this._transferSimulator.transferFromAsync(
                        order.takerFeeAssetData,
                        takerAddress,
                        order.feeRecipientAddress,
                        takerFeePaid,
                        TradeSide.Taker,
                        TransferType.Fee,
                    );
                }
            }
        } catch (err) {
            throw new Error(FillOrderError.TransferFailed);
        }

        return {
            takerAssetFilledAmount: finalTakerAssetFillAmount,
            makerAssetFilledAmount: makerAssetFillAmount,
            makerFeePaid,
            takerFeePaid,
        };
    }
}

function validateFill(
    order: Order,
    takerAddress: string,
    takerAssetFillAmount: BigNumber,
    makerAssetFilledAmount: BigNumber,
    takerAssetFilledAmount: BigNumber,
    remainingTakerAssetAmount: BigNumber,
): void {
    const now = Math.floor(_.now() / 1000);
    if (remainingTakerAssetAmount.isEqualTo(0) || order.expirationTimeSeconds.isLessThanOrEqualTo(now)) {
        throw new Error(FillOrderError.OrderUnfillable);
    }

    if (order.senderAddress !== constants.NULL_ADDRESS && order.senderAddress !== takerAddress) {
        throw new Error(FillOrderError.InvalidSender);
    }

    if (order.takerAddress !== constants.NULL_ADDRESS && order.takerAddress !== takerAddress) {
        throw new Error(FillOrderError.InvalidTaker);
    }

    if (order.makerAssetAmount.isEqualTo(0)) {
        throw new Error(FillOrderError.InvalidMakerAmount);
    }

    if (takerAssetFillAmount.isEqualTo(0)) {
        throw new Error(FillOrderError.InvalidTakerAmount);
    }

    if (
        makerAssetFilledAmount
            .times(order.takerAssetAmount)
            .isGreaterThan(takerAssetFilledAmount.times(order.makerAssetAmount))
    ) {
        throw new Error(FillOrderError.InvalidFillPrice);
    }
}
