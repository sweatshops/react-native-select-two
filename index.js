//import liraries
import React, { Component } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, FlatList, TextInput, Dimensions, Animated, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import Button from './lib/Button';
import TagItem from './lib/TagItem';
import utilities from './lib/utilities';
import PropTypes from 'prop-types';
import { Translation } from 'react-i18next';

const { height } = Dimensions.get('window');
const INIT_HEIGHT = height * 0.6;
// create a component
class Select2 extends Component {
    static defaultProps = {
        cancelButtonText: 'Hủy',
        selectButtonText: 'Chọn',
        searchPlaceHolderText: "Nhập vào từ khóa",
        listEmptyTitle: 'Không tìm thấy lựa chọn phù hợp',
        colorTheme: '#16a45f',
        buttonTextStyle: {},
        buttonStyle: {},
        showSearchBox: true,
        disabled: false,
        translationKey: ''
    }
    state = {
        show: false,
        preSelectedItem: [],
        selectedItem: [],
        data: [],
        keyword: ''
    }
    animatedHeight = new Animated.Value(INIT_HEIGHT);

    componentDidMount() {
        this.init();
    };

    UNSAFE_componentWillReceiveProps(newProps) {
        this.init(newProps);
    }

    init(newProps) {
        let preSelectedItem = [];
        let { data } = newProps || this.props;
        data.map(item => {
            if (item.checked) {
                preSelectedItem.push(item);
            }
        })
        this.setState({ data, preSelectedItem });
    }

    get dataRender() {
        let { data, keyword } = this.state;
        let listMappingKeyword = [];
        data.map(item => {
            if (utilities.changeAlias(item.name).includes(utilities.changeAlias(keyword))) {
                listMappingKeyword.push(item);
            }
        });
        return listMappingKeyword;
    }

    get defaultFont() {
        let { defaultFontName } = this.props;
        return defaultFontName ? { fontFamily: defaultFontName } : {};
    }

    cancelSelection() {
        let { data, preSelectedItem } = this.state;
        data.map(item => {
            item.checked = false;
            for (let _selectedItem of preSelectedItem) {
                if (item.id === _selectedItem.id) {
                    item.checked = true;
                    break;
                }
            }
        });
        this.setState({ data, show: false, keyword: '', selectedItem: preSelectedItem });
    }

    onItemSelected = async (item, isSelectSingle) => {
        let selectedItem = [];
        let { data } = this.state;
        for (let index in data) {
            if (data[index].id === item.id) {
                data[index] = item;
                data[index].checked = true;
            } else if (isSelectSingle) {
                data[index].checked = false;
            }
        }
        // data.map(item => {
        //     if (item.checked) selectedItem.push(item);
        // })

        for (const item in data) {
            if (data.hasOwnProperty(item)) {
                if (data[item].checked) {
                    selectedItem = [...selectedItem, data[item]];
                }
            }
        }

        return selectedItem;

        // this.setState({ data, selectedItem });
    }

    keyExtractor = (item, idx) => idx.toString();
    renderItem = ({ item, idx }) => {
        let { colorTheme, isSelectSingle, onSelect, translationKey } = this.props;
        return (
            <Translation>
                {
                    t => (
                        <TouchableOpacity
                            disabled={item.disabled}
                            key={idx}
                            onPress={async () => {
                                let selectedItem = await this.onItemSelected(item, isSelectSingle)

                                let selectedIds = [], selectedObjectItems = [];

                                for (const item in selectedItem) {
                                    if (selectedItem.hasOwnProperty(item)) {
                                        const element = selectedItem[item];
                                        selectedIds.push(element.id);
                                        selectedObjectItems.push(element);
                                    }
                                }
                                selectedIds && onSelect && onSelect(selectedIds, selectedObjectItems);
                                this.setState({ show: false, keyword: '', preSelectedItem: selectedItem });
                            }}
                            activeOpacity={0.7}
                            style={styles.itemWrapper}>
                            {
                                item.imageUrl &&
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 5,
                                        marginRight: 15,
                                        resizeMode: 'contain'
                                    }}
                                    source={{
                                        uri: item.imageUrl,
                                    }}
                                />
                            }
                            <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                                <Text style={[styles.itemText, this.defaultFont, { textDecorationLine: item.disabled ? 'line-through' : 'none' }]}>
                                    {t(`${translationKey}${item.name}`)}
                                </Text>
                                {
                                    item.reason !== '' &&
                                    <Text style={[styles.reasonText, this.defaultFont]}>
                                        {t(item.reason)}
                                    </Text>
                                }
                            </View>
                            <Icon style={styles.itemIcon}
                                name={item.checked ? 'check-circle-outline' : 'radiobox-blank'}
                                color={item.checked ? colorTheme : '#777777'} size={20} />
                        </TouchableOpacity>
                    )
                }
            </Translation>
        );
    }
    renderEmpty = () => {
        let { listEmptyTitle } = this.props;
        return (
            <Text style={[styles.empty, this.defaultFont]}>
                {listEmptyTitle}
            </Text>
        );
    }
    closeModal = () => this.setState({ show: false });
    showModal = () => this.setState({ show: true });

    render() {
        let {
            style, modalStyle, title, onSelect, onRemoveItem, popupTitle, colorTheme,
            isSelectSingle, cancelButtonText, selectButtonText, searchPlaceHolderText,
            selectedTitleStyle, buttonTextStyle, buttonStyle, showSearchBox, disabled,
            translationKey
        } = this.props;
        let { show, selectedItem, preSelectedItem } = this.state;
        return (
            <Translation>
                {
                    t => (
                        <TouchableOpacity
                            disabled={disabled}
                            onPress={this.showModal}
                            activeOpacity={0.7}
                            style={[styles.container, style]}>
                            <Modal
                                onBackdropPress={this.closeModal}
                                style={{
                                    justifyContent: 'flex-end',
                                    margin: 0
                                }}
                                useNativeDriver={true}
                                animationInTiming={300}
                                animationOutTiming={300}
                                hideModalContentWhileAnimating
                                isVisible={show}>
                                <Animated.View style={[styles.modalContainer, modalStyle, { height: this.animatedHeight }]}>
                                    <View>
                                        <Text style={[styles.title, this.defaultFont, { color: colorTheme }]}>
                                            {popupTitle || title}
                                        </Text>
                                    </View>
                                    <View style={styles.line} />
                                    {
                                        showSearchBox
                                            ? <TextInput
                                                underlineColorAndroid='transparent'
                                                returnKeyType='done'
                                                style={[styles.inputKeyword, this.defaultFont]}
                                                placeholder={searchPlaceHolderText}
                                                selectionColor={colorTheme}
                                                onChangeText={keyword => this.setState({ keyword })}
                                                onFocus={() => {
                                                    Animated.spring(this.animatedHeight, {
                                                        toValue: INIT_HEIGHT + (Platform.OS === 'ios' ? height * 0.2 : 0),
                                                        friction: 7
                                                    }).start();
                                                }}
                                                onBlur={() => {
                                                    Animated.spring(this.animatedHeight, {
                                                        toValue: INIT_HEIGHT,
                                                        friction: 7
                                                    }).start();
                                                }}
                                            />
                                            : null
                                    }
                                    <FlatList
                                        style={styles.listOption}
                                        data={this.dataRender || []}
                                        keyExtractor={this.keyExtractor}
                                        renderItem={this.renderItem}
                                        ListEmptyComponent={this.renderEmpty}
                                    />

                                    <View style={styles.buttonWrapper}>
                                        <Button
                                            defaultFont={this.defaultFont}
                                            onPress={() => {
                                                this.cancelSelection();
                                            }}
                                            title={cancelButtonText}
                                            textColor={colorTheme}
                                            backgroundColor='#fff'
                                            textStyle={buttonTextStyle}
                                            style={[styles.button, buttonStyle, { marginRight: 5, marginLeft: 10, borderWidth: 1, borderColor: colorTheme }]} />
                                        <Button
                                            defaultFont={this.defaultFont}
                                            onPress={() => {
                                                let selectedIds = [], selectedObjectItems = [];
                                                selectedItem.map(item => {
                                                    selectedIds.push(item.id);
                                                    selectedObjectItems.push(item);
                                                })
                                                onSelect && onSelect(selectedIds, selectedObjectItems);
                                                this.setState({ show: false, keyword: '', preSelectedItem: selectedItem });
                                            }}
                                            title={selectButtonText}
                                            backgroundColor={colorTheme}
                                            textStyle={buttonTextStyle}
                                            style={[styles.button, buttonStyle, { marginLeft: 5, marginRight: 10 }]} />
                                    </View>
                                </Animated.View>
                            </Modal>
                            {
                                preSelectedItem.length > 0
                                    ? (
                                        isSelectSingle
                                            ? <Text style={[{ color: '#333' }, styles.selectedTitlte, this.defaultFont, selectedTitleStyle]}>{t(`${translationKey}${preSelectedItem[0].name}`)}</Text>
                                            : <View style={styles.tagWrapper}>
                                                {
                                                    preSelectedItem.map((tag, index) => {
                                                        return (
                                                            <TagItem
                                                                key={index}
                                                                onRemoveTag={() => {
                                                                    let preSelectedItem = [];
                                                                    let selectedIds = [], selectedObjectItems = [];
                                                                    let { data } = this.state;
                                                                    data.map(item => {
                                                                        if (item.id === tag.id) {
                                                                            item.checked = false;
                                                                        }
                                                                        if (item.checked) {
                                                                            preSelectedItem.push(item);
                                                                            selectedIds.push(item.id);
                                                                            selectedObjectItems.push(item);
                                                                        };
                                                                    })
                                                                    this.setState({ data, preSelectedItem });
                                                                    onRemoveItem && onRemoveItem(selectedIds, selectedObjectItems);
                                                                }}
                                                                tagName={tag.name} />
                                                        );
                                                    })
                                                }
                                            </View>
                                    )
                                    : <Text style={[styles.selectedTitlte, this.defaultFont, selectedTitleStyle]}>{title}</Text>
                            }
                        </TouchableOpacity>
                    )
                }
            </Translation>
        );
    }
}

// define your styles
const styles = StyleSheet.create({
    container: {
        width: '100%', minHeight: 45, borderRadius: 2, paddingHorizontal: 16,
        flexDirection: 'row', alignItems: 'center', borderWidth: 1,
        borderColor: '#cacaca', paddingVertical: 4
    },
    modalContainer: {
        paddingTop: 16, backgroundColor: '#fff', borderTopLeftRadius: 8, borderTopRightRadius: 8
    },
    title: {
        fontSize: 16, marginBottom: 16, width: '100%', textAlign: 'center'
    },
    line: {
        height: 1, width: '100%', backgroundColor: '#cacaca'
    },
    inputKeyword: {
        height: 40, borderRadius: 5, borderWidth: 1, borderColor: '#cacaca',
        color: '#212121',
        paddingLeft: 8, marginHorizontal: 24, marginTop: 16
    },
    buttonWrapper: {
        marginVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'
    },
    button: {
        height: 36, flex: 1
    },
    selectedTitlte: {
        fontSize: 14, color: 'gray', flex: 1
    },
    tagWrapper: {
        flexDirection: 'row', flexWrap: 'wrap'
    },
    listOption: {
        paddingHorizontal: 24,
        paddingTop: 1, marginTop: 16
    },
    itemWrapper: {
        borderBottomWidth: 1, borderBottomColor: '#eaeaea',
        paddingVertical: 12, flexDirection: 'row', alignItems: 'center'
    },
    itemText: {
        fontSize: 16, color: '#333', flex: 1
    },
    reasonText: {
        fontSize: 12, color: '#9E9E9E', flex: 1
    },
    itemIcon: {
        width: 30, textAlign: 'right'
    },
    empty: {
        fontSize: 16, color: 'gray', alignSelf: 'center', textAlign: 'center', paddingTop: 16
    }
});

Select2.propTypes = {
    data: PropTypes.array.isRequired,
    style: PropTypes.object,
    defaultFontName: PropTypes.string,
    selectedTitleStyle: PropTypes.object,
    buttonTextStyle: PropTypes.object,
    buttonStyle: PropTypes.object,
    title: PropTypes.string,
    onSelect: PropTypes.func,
    onRemoveItem: PropTypes.func,
    popupTitle: PropTypes.string,
    colorTheme: PropTypes.string,
    isSelectSingle: PropTypes.bool,
    showSearchBox: PropTypes.bool,
    cancelButtonText: PropTypes.string,
    selectButtonText: PropTypes.string,
    disabled: PropTypes.bool,
    translationKey: PropTypes.string
}

//make this component available to the app
export default Select2;
