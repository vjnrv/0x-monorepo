# coding: utf-8


import pprint
import re  # noqa: F401

import six


class RelayerApiAssetDataTradeInfoSchema(object):
    """
    Attributes:
      openapi_types (dict): The key is attribute name
                            and the value is attribute type.
      attribute_map (dict): The key is attribute name
                            and the value is json key in definition.
    """
    openapi_types = {
        "asset_data": "str",
        "min_amount": "str",
        "max_amount": "str",
        "precision": "float",
    }

    attribute_map = {
        "asset_data": "assetData",
        "min_amount": "minAmount",
        "max_amount": "maxAmount",
        "precision": "precision",
    }

    def __init__(
        self, asset_data=None, min_amount=None, max_amount=None, precision=None
    ):  # noqa: E501
        """RelayerApiAssetDataTradeInfoSchema - a model defined in OpenAPI"""  # noqa: E501

        self._asset_data = None
        self._min_amount = None
        self._max_amount = None
        self._precision = None
        self.discriminator = None

        self.asset_data = asset_data
        if min_amount is not None:
            self.min_amount = min_amount
        if max_amount is not None:
            self.max_amount = max_amount
        if precision is not None:
            self.precision = precision

    @property
    def asset_data(self):
        """Gets the asset_data of this RelayerApiAssetDataTradeInfoSchema.


        :return: The asset_data of this RelayerApiAssetDataTradeInfoSchema.
        :rtype: str
        """
        return self._asset_data

    @asset_data.setter
    def asset_data(self, asset_data):
        """Sets the asset_data of this RelayerApiAssetDataTradeInfoSchema.


        :param asset_data: The asset_data of this RelayerApiAssetDataTradeInfoSchema.
        :type: str
        """
        if asset_data is None:
            raise ValueError(
                "Invalid value for `asset_data`, must not be `None`"
            )  # noqa: E501
        if asset_data is not None and not re.search(
            r"^0x(([0-9a-f][0-9a-f])+)?$", asset_data
        ):  # noqa: E501
            raise ValueError(
                r"Invalid value for `asset_data`, must be a follow pattern or equal to `/^0x(([0-9a-f][0-9a-f])+)?$/`"
            )  # noqa: E501

        self._asset_data = asset_data

    @property
    def min_amount(self):
        """Gets the min_amount of this RelayerApiAssetDataTradeInfoSchema.


        :return: The min_amount of this RelayerApiAssetDataTradeInfoSchema.
        :rtype: str
        """
        return self._min_amount

    @min_amount.setter
    def min_amount(self, min_amount):
        """Sets the min_amount of this RelayerApiAssetDataTradeInfoSchema.


        :param min_amount: The min_amount of this RelayerApiAssetDataTradeInfoSchema.
        :type: str
        """
        if min_amount is not None and not re.search(
            r"^\d+$", min_amount
        ):  # noqa: E501
            raise ValueError(
                r"Invalid value for `min_amount`, must be a follow pattern or equal to `/^\d+$/`"
            )  # noqa: E501

        self._min_amount = min_amount

    @property
    def max_amount(self):
        """Gets the max_amount of this RelayerApiAssetDataTradeInfoSchema.


        :return: The max_amount of this RelayerApiAssetDataTradeInfoSchema.
        :rtype: str
        """
        return self._max_amount

    @max_amount.setter
    def max_amount(self, max_amount):
        """Sets the max_amount of this RelayerApiAssetDataTradeInfoSchema.


        :param max_amount: The max_amount of this RelayerApiAssetDataTradeInfoSchema.
        :type: str
        """
        if max_amount is not None and not re.search(
            r"^\d+$", max_amount
        ):  # noqa: E501
            raise ValueError(
                r"Invalid value for `max_amount`, must be a follow pattern or equal to `/^\d+$/`"
            )  # noqa: E501

        self._max_amount = max_amount

    @property
    def precision(self):
        """Gets the precision of this RelayerApiAssetDataTradeInfoSchema.


        :return: The precision of this RelayerApiAssetDataTradeInfoSchema.
        :rtype: float
        """
        return self._precision

    @precision.setter
    def precision(self, precision):
        """Sets the precision of this RelayerApiAssetDataTradeInfoSchema.


        :param precision: The precision of this RelayerApiAssetDataTradeInfoSchema.
        :type: float
        """

        self._precision = precision

    def to_dict(self):
        """Returns the model properties as a dict"""
        result = {}

        for attr, _ in six.iteritems(self.openapi_types):
            value = getattr(self, attr)
            if isinstance(value, list):
                result[attr] = list(
                    map(
                        lambda x: x.to_dict() if hasattr(x, "to_dict") else x,
                        value,
                    )
                )
            elif hasattr(value, "to_dict"):
                result[attr] = value.to_dict()
            elif isinstance(value, dict):
                result[attr] = dict(
                    map(
                        lambda item: (item[0], item[1].to_dict())
                        if hasattr(item[1], "to_dict")
                        else item,
                        value.items(),
                    )
                )
            else:
                result[attr] = value

        return result

    def to_str(self):
        """Returns the string representation of the model"""
        return pprint.pformat(self.to_dict())

    def __repr__(self):
        """For `print` and `pprint`"""
        return self.to_str()

    def __eq__(self, other):
        """Returns true if both objects are equal"""
        if not isinstance(other, RelayerApiAssetDataTradeInfoSchema):
            return False

        return self.__dict__ == other.__dict__

    def __ne__(self, other):
        """Returns true if both objects are not equal"""
        return not self == other
