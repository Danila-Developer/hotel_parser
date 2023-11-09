import {
    EuiHeader,
    EuiHeaderLink,
    EuiHeaderLinks,
    EuiHeaderLogo,
    EuiHeaderSection,
    EuiHeaderSectionItem,
    EuiSpacer
} from '@elastic/eui'
import { Link, useNavigate } from 'react-router-dom'

import { routes } from '../../router'

const Header = () => {
    const navigate = useNavigate()

    return (
        <>
            <EuiHeader>
                <EuiHeaderSection side="left">
                    <EuiHeaderSectionItem>
                        <EuiHeaderLogo
                            iconType="consoleApp"
                            onClick={() => navigate(routes.home.path)}
                            className="c-pointer"
                        >
                            Hotel parser
                        </EuiHeaderLogo>
                    </EuiHeaderSectionItem>
                </EuiHeaderSection>
                <EuiHeaderSection>
                    <EuiHeaderSectionItem side="left">
                        <EuiHeaderLinks>
                            <EuiHeaderLink color="primary" size="m" onClick={() => navigate(routes.history.path)}>История запросов</EuiHeaderLink>
                        </EuiHeaderLinks>
                    </EuiHeaderSectionItem>
                </EuiHeaderSection>
                <EuiHeaderSection side="right">
                    <EuiHeaderSectionItem>
                        <EuiHeaderLinks>
                            <Link to={routes.createRequest.path}>
                                <EuiHeaderLink
                                    iconType="plusInCircle"
                                    type="button"
                                    color="primary"
                                    size="m"
                                >
                                    Новый запрос
                                </EuiHeaderLink>
                            </Link>
                            <Link to={routes.settings.path}>
                                <EuiHeaderLink
                                    iconType="controlsHorizontal"
                                    type="button"
                                    color="primary"
                                    size="m"
                                >
                                    Настройки
                                </EuiHeaderLink>
                            </Link>
                        </EuiHeaderLinks>
                    </EuiHeaderSectionItem>
                </EuiHeaderSection>
            </EuiHeader>
            <EuiSpacer size="s" />
        </>
    )
}

export default Header